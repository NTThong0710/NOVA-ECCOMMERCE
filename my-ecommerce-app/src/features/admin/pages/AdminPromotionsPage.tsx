import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { toast } from 'react-hot-toast';

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([
        { id: 1, code: 'WELCOME10', type: 'PERCENTAGE', value: 10, usageLimit: 100, usedCount: 0, expiry: '2027-12-31', isActive: true },
        { id: 2, code: 'FLAT20', type: 'FIXED', value: 20000, usageLimit: null, usedCount: 0, expiry: '2027-10-15', isActive: true },
        { id: 3, code: 'SUMMER25', type: 'PERCENTAGE', value: 25, usageLimit: 50, usedCount: 0, expiry: '2027-08-31', isActive: true },
        { id: 4, code: 'NEWUSER', type: 'PERCENTAGE', value: 15, usageLimit: 200, usedCount: 0, expiry: '2027-12-31', isActive: true },
    ]);

    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        startDate: '',
        expiryDate: '',
        usageLimit: null as number | null,
        description: ''
    });

    const handleDelete = (id: number) => {
        setPromotions(promotions.filter(p => p.id !== id));
        toast.success('Đã xóa coupon');
    };

    const handleToggle = (id: number) => {
        setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
        toast.success('Đã cập nhật trạng thái');
    };

    const handleSave = () => {
        if (!formData.code || formData.value <= 0) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        setPromotions([...promotions, { ...formData, id: Date.now(), usedCount: 0, isActive: true, expiry: formData.expiryDate }]);
        setShowDialog(false);
        toast.success('Đã thêm coupon mới');
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quản lý Khuyến mãi</h2>
                <Button label="Thêm Coupon" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
            </div>

            <div className="mb-4 text-sm text-gray-500">
                Sample codes for testing: SALE10, MINUS50K
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Code</th>
                            <th className="p-2">Loại</th>
                            <th className="p-2">Giá trị</th>
                            <th className="p-2">Đã dùng</th>
                            <th className="p-2">Hết hạn</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(p => (
                            <tr key={p.id} className="border-b">
                                <td className="p-2 font-bold">{p.code}</td>
                                <td className="p-2">{p.type}</td>
                                <td className="p-2">{p.type === 'PERCENTAGE' ? p.value + '%' : p.value.toLocaleString() + 'đ'}</td>
                                <td className="p-2">{p.usedCount} / {p.usageLimit || '∞'}</td>
                                <td className="p-2">{p.expiry}</td>
                                <td className="p-2">
                                    <Tag value={p.isActive ? 'ACTIVE' : 'INACTIVE'} severity={p.isActive ? 'success' : 'danger'} />
                                </td>
                                <td className="p-2 flex gap-2">
                                    <Button icon="pi pi-sync" size="small" rounded onClick={() => handleToggle(p.id)} />
                                    <Button icon="pi pi-trash" size="small" rounded severity="danger" onClick={() => handleDelete(p.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog visible={showDialog} onHide={() => setShowDialog(false)} header="Tạo Coupon Mới" className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1 font-bold">Code</label>
                        <InputText className="w-full uppercase" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                        <label className="block mb-1 font-bold">Loại</label>
                        <Dropdown className="w-full" options={[{ label: 'Phần trăm (%)', value: 'PERCENTAGE' }, { label: 'Giá tiền', value: 'FIXED' }]} value={formData.type} onChange={e => setFormData({ ...formData, type: e.value })} />
                    </div>
                    <div>
                        <label className="block mb-1 font-bold">Giá trị</label>
                        <InputNumber className="w-full" value={formData.value} onValueChange={e => setFormData({ ...formData, value: e.value || 0 })} />
                    </div>
                    {formData.type === 'PERCENTAGE' && (
                        <div>
                            <label className="block mb-1 font-bold">Giảm tối đa (đ)</label>
                            <InputNumber className="w-full" value={formData.maxDiscountAmount} onValueChange={e => setFormData({ ...formData, maxDiscountAmount: e.value || 0 })} />
                        </div>
                    )}
                    <div>
                        <label className="block mb-1 font-bold">Giá trị đơn tối thiểu (đ)</label>
                        <InputNumber className="w-full" value={formData.minOrderAmount} onValueChange={e => setFormData({ ...formData, minOrderAmount: e.value || 0 })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block mb-1 font-bold">Ngày bắt đầu</label>
                            <InputText type="date" className="w-full" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold">Ngày hết hạn</label>
                            <InputText type="date" className="w-full" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                        </div>
                    </div>
                    <Button label="Lưu Coupon" onClick={handleSave} className="mt-4" />
                </div>
            </Dialog>
        </div>
    );
}
