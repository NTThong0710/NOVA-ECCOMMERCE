import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../cart/store/cartStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../../core/api/apiConfig';

const API_BASE = API_BASE_URL;


const getHeaders = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

interface ShippingForm {
    fullName: string;
    phone: string;
    address: string;
}

const CheckoutPage: React.FC = () => {
    const { t } = useTranslation();
    const { items, clearCart } = useCartStore();
    const { username, profile } = useAuthStore();


    const navigate = useNavigate();

    const [shippingForm, setShippingForm] = useState<ShippingForm>({
        fullName: profile?.username || username || '',
        phone: profile?.phone || '',
        address: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('VNPAY');
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        if (items.length === 0 && !isCheckingOut) {
            navigate('/cart');
        }
    }, [items, navigate, isCheckingOut]);

    const orderAmount = items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const res = await axios.post(`${API_BASE}/api/promotions/validate`, {
                code: couponCode.trim(),
                userEmail: username || 'guest',
                orderAmount: orderAmount
            });
            if (res.data.valid) {
                setDiscountAmount(res.data.discountAmount);
                setCouponMessage(`Applied: -${formatCurrency(res.data.discountAmount)}`);
                toast.success('Mã giảm giá đã được áp dụng!');
            } else {
                setDiscountAmount(0);
                setCouponMessage(res.data.message);
                toast.error(res.data.message);
            }
        } catch (error: any) {
            setDiscountAmount(0);
            setCouponMessage(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            toast.error('Mã giảm giá không hợp lệ');
        }
    };

    const handleCheckout = async () => {
        if (!shippingForm.fullName || !shippingForm.phone || !shippingForm.address) {
            toast.error(t('checkout.enter_address', 'Vui lòng nhập đầy đủ thông tin giao hàng'));
            return;
        }

        setIsCheckingOut(true);
        toast.loading('Đang khởi tạo đơn hàng...', { id: 'checkout' });

        try {
            const checkoutPayload = {
                userEmail: username || 'guest',
                items: items.map(item => ({
                    productId: item.id,
                    productTitle: item.title,
                    quantity: item.quantity,
                    price: item.discountPrice || item.price
                })),
                shippingAddress: shippingForm.address,
                fullName: shippingForm.fullName,
                phone: shippingForm.phone,
                paymentMethod: paymentMethod,
                couponCode: discountAmount > 0 ? couponCode : null,
                totalAmount: finalAmount,
                notes: `Người nhận: ${shippingForm.fullName} - ${shippingForm.phone}`
            };

            const response = await axios.post(`${API_BASE}/api/orders/checkout`, checkoutPayload, { headers: getHeaders() });

            if (paymentMethod === 'VNPAY') {
                const { paymentUrl, orderId } = response.data;
                sessionStorage.setItem('pendingOrderId', String(orderId));
                sessionStorage.setItem('pendingOrderTotal', String(finalAmount));
                
                toast.success('Chuyển hướng đến cổng VNPAY...', { id: 'checkout' });
                
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    throw new Error('Không nhận được đường dẫn thanh toán VNPay');
                }
            } else {
                // COD Flow
                toast.success(t('checkout.order_success', 'Đặt hàng thành công!'), { id: 'checkout' });
                clearCart();
                navigate('/orders');
            }
        } catch (error: any) {
            console.error('Checkout failed', error);
            toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại!', { id: 'checkout' });
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto">
                
                {/* Left: Shipping Details */}
                <div className="lg:col-span-7 px-6 lg:px-16 py-12 lg:py-16 border-r border-slate-100 dark:border-slate-800">
                    
                    {/* Header */}
                    <div className="mb-10">
                        <Link to="/" className="text-xl font-black tracking-tighter uppercase mb-8 block text-slate-900 dark:text-white">
                            NOVA ECOMMERCE
                        </Link>
                        
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                            <Link to="/cart" className="hover:text-black dark:hover:text-white transition-colors">{t('cart.title', 'Giỏ hàng')}</Link>
                            <i className="pi pi-angle-right text-[10px]"></i>
                            <span className="text-slate-900 dark:text-white font-bold">{t('checkout.title', 'Thanh toán')}</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Contact Info */}
                        <section>
                            <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">{t('checkout.contact_info', 'Thông tin người nhận')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t('checkout.fullname', 'Họ và tên')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('checkout.fullname', 'Họ và tên')}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#785A46] outline-none transition-all placeholder:text-slate-400 dark:text-white font-semibold"
                                        value={shippingForm.fullName}
                                        onChange={e => setShippingForm(f => ({ ...f, fullName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">{t('checkout.phone', 'Số điện thoại')}</label>
                                    <input
                                        type="tel"
                                        placeholder={t('checkout.phone', 'Số điện thoại')}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#785A46] outline-none transition-all placeholder:text-slate-400 dark:text-white font-semibold"
                                        value={shippingForm.phone}
                                        onChange={e => setShippingForm(f => ({ ...f, phone: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Address */}
                        <section>
                            <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">{t('checkout.shipping_address', 'Địa chỉ giao hàng')}</h2>
                            <div>
                                <textarea
                                    placeholder={t('checkout.enter_address', 'Nhập địa chỉ nhận hàng (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)...')}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#785A46] outline-none transition-all placeholder:text-slate-400 dark:text-white resize-none font-semibold"
                                    value={shippingForm.address}
                                    onChange={e => setShippingForm(f => ({ ...f, address: e.target.value }))}
                                />
                            </div>
                        </section>

                        {/* Payment Method Selection */}
                        <section>
                            <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                                {t('checkout.payment_method', 'Phương thức thanh toán')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        paymentMethod === 'COD' 
                                            ? 'border-[#785A46] bg-[#785A46]/5 dark:bg-[#785A46]/10 shadow-sm' 
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        checked={paymentMethod === 'COD'} 
                                        onChange={() => setPaymentMethod('COD')} 
                                        className="w-4 h-4 accent-[#785A46]" 
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>💵</span> {t('checkout.cod', 'Thanh toán khi nhận hàng (COD)')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">Thanh toán tiền mặt cho shipper</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setPaymentMethod('VNPAY')}
                                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        paymentMethod === 'VNPAY' 
                                            ? 'border-[#785A46] bg-[#785A46]/5 dark:bg-[#785A46]/10 shadow-sm' 
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        checked={paymentMethod === 'VNPAY'} 
                                        onChange={() => setPaymentMethod('VNPAY')} 
                                        className="w-4 h-4 accent-[#785A46]" 
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>💳</span> {t('checkout.vnpay', 'Thanh toán Online VNPAY')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">Thẻ ATM / QR / Internet Banking</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Action */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <Link to="/cart" className="text-sm font-semibold text-slate-500 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors">
                                <i className="pi pi-angle-left"></i> {t('common.back', 'Quay lại giỏ')}
                            </Link>
                            <button 
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="bg-[#785A46] hover:bg-[#5C4033] text-white px-8 py-3.5 font-bold text-xs tracking-widest uppercase rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                                {isCheckingOut 
                                    ? t('common.loading', 'Đang xử lý...') 
                                    : paymentMethod === 'VNPAY' 
                                        ? t('checkout.submit', 'Xác nhận & Thanh toán VNPAY') 
                                        : 'Xác nhận đặt hàng (COD)'}
                            </button>
                        </div>
                    </div>
                </div>


                {/* Right: Order Summary (Sticky) */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/50 px-6 lg:px-12 py-12 lg:py-16 lg:min-h-screen border-l border-slate-100 dark:border-slate-800">
                    <div className="lg:sticky lg:top-12">
                        {/* Cart Items */}
                        <div className="space-y-4 mb-8">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0 p-1">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                        <span className="absolute -top-2 -right-2 bg-[#785A46] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                                        <span className="text-xs text-slate-500 uppercase font-semibold">{item.brand || item.category}</span>
                                    </div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                                        {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon */}
                        <div className="flex gap-3 mb-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <input 
                                type="text"
                                placeholder={t('checkout.enter_coupon', 'Nhập mã giảm giá (VD: WELCOME10)')}
                                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#785A46] outline-none transition-all placeholder:text-slate-400 uppercase dark:text-white font-semibold"
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                            />
                            <button 
                                onClick={handleApplyCoupon}
                                className="bg-[#785A46] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#5C4033] transition-colors"
                            >
                                {t('checkout.apply_coupon', 'Áp dụng')}
                            </button>
                        </div>
                        {couponMessage && (
                            <p className={`text-xs font-semibold mb-6 ${discountAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {couponMessage}
                            </p>
                        )}

                        {/* Totals */}
                        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                                <span>{t('cart.subtotal', 'Tạm tính')}</span>
                                <span>{formatCurrency(orderAmount)}</span>
                            </div>
                            
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>{t('checkout.discount', 'Giảm giá')}</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                                <span>{t('checkout.shipping_fee', 'Phí vận chuyển')}</span>
                                <span className="text-green-600 font-bold uppercase">{t('checkout.free_shipping', 'Miễn phí')}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-slate-900 dark:text-white">
                                <span className="font-bold text-base uppercase">{t('checkout.total_pay', 'Tổng cộng')}</span>
                                <span className="font-black text-2xl tracking-tight">
                                    {formatCurrency(finalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
