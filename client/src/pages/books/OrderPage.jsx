import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2'; 

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/loans/history');
            const data = response.data?.history || response.data?.orders || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleReturn = async (loanId) => {
        const result = await Swal.fire({
            title: 'Xác nhận trả sách?',
            text: "Bạn có chắc chắn muốn trả cuốn sách này?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/loans/return/${loanId}`); 
                
                await Swal.fire("Thành công!", "Sách đã được hoàn trả vào kho.", "success");
                
                fetchOrders(); 
            } catch (error) {
                Swal.fire("Lỗi", "Không thể thực hiện trả sách.", "error");
            }
        }
    };

    if (loading) return <div className="text-center p-10">Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen mt-10 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Thư viện của tôi</h2>
            
            <div className="space-y-4">
                {orders.map((loan) => (
                    <div key={loan.loan_id} className="p-5 border-2 border-gray-100 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                {/* Hiển thị ảnh sách nếu có */}
                                <img 
                                    src={loan.borrowed_book?.cover_image_url || 'https://via.placeholder.com/60x80'} 
                                    className="w-16 h-20 object-cover rounded shadow-sm"
                                    alt="book"
                                />
                                <div>
                                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                                        loan.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {loan.status === 'returned' ? 'Đã trả' : 'Đang mượn'}
                                    </span>
                                    <h3 className="mt-2 font-bold text-gray-700 text-lg">
                                        {loan.borrowed_book?.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">Hạn trả: {new Date(loan.due_date).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* NÚT TRẢ SÁCH: Chỉ hiện khi sách chưa trả */}
                            {loan.status !== 'returned' && (
                                <button 
                                    onClick={() => handleReturn(loan.loan_id)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                                >
                                    Trả sách ngay
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderPage;