
import { useEffect, useState } from 'react';
import { AdminProductService } from '../services/AdminProductService';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { toast } from 'react-hot-toast';
import { Tag } from 'primereact/tag';

const AdminProductsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [page, search]);

    const loadProducts = async () => {
        try {
            const data = await AdminProductService.getAllProducts(page, search);
            setProducts(data.content || data.items || data || []);
        } catch (error) {
            toast.error('Lỗi khi tải sản phẩm');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa?')) {
            try {
                await AdminProductService.deleteProduct(id);
                toast.success('Xóa thành công');
                loadProducts();
            } catch (error) {
                toast.error('Lỗi khi xóa');
            }
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quản lý Sản phẩm</h2>
                <Button label="Thêm mới" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
            </div>
            
            <div className="mb-4">
                <InputText 
                    placeholder="Tìm kiếm..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full md:w-1/3"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">ID</th>
                            <th className="p-2">Tên</th>
                            <th className="p-2">Giá</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                                <td className="p-2">{p.id}</td>
                                <td className="p-2">{p.name}</td>
                                <td className="p-2">{p.price?.toLocaleString()}đ</td>
                                <td className="p-2">
                                    <Tag value={p.status || 'ACTIVE'} severity={p.status === 'INACTIVE' ? 'danger' : 'success'} />
                                </td>
                                <td className="p-2 flex gap-2">
                                    <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-sm" />
                                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => handleDelete(p.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between mt-4">
                <Button label="Trang trước" disabled={page === 0} onClick={() => setPage(p => p - 1)} />
                <Button label="Trang sau" onClick={() => setPage(p => p + 1)} />
            </div>

            <Dialog header="Sản phẩm" visible={showDialog} onHide={() => setShowDialog(false)} className="w-full md:w-1/2">
                <div className="p-4 text-center">Chức năng tạo/sửa sẽ được implement chi tiết.</div>
            </Dialog>
        </div>
    );
};
export default AdminProductsPage;
