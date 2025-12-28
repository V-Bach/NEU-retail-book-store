import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { clearCart } from '../../redux/features/cart/cartSlice';
import Swal from 'sweetalert2';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Khởi tạo react-hook-form
    const { register, handleSubmit, formState: { errors } } = useForm();
    
    // State quản lý checkbox và thời hạn mượn (Backend yêu cầu 7 hoặc 14)
    const [isChecked, setIschecked] = useState(false);
    const [duration, setDuration] = useState(14); 

    // Tính tổng giá trị sách dựa trên thuộc tính price hoặc newPrice
    const totalPrice = cartItems.reduce((acc, item) => acc + Number(item.price || item.newPrice || 0), 0).toFixed(2);
    
    // Giả định User đã login, email sẽ được lấy từ localStorage hoặc state auth
    const currentUser = JSON.parse(localStorage.getItem('user')) || { email: "guest@example.com" };

    const onSubmit = async (data) => {
        if (cartItems.length === 0) {
            Swal.fire("Thông báo", "Giỏ hàng trống!", "warning");
            return;
        }

        // Cấu trúc dữ liệu gửi lên khớp với hàm checkoutLoan của bạn
        const loanPayload = {
            bookIds: cartItems.map(item => Number(item.book_id || item._id)),
            duration: Number(duration), // 7 hoặc 14
            name: data.name,
            phone: data.phone
        }

        try {
            Swal.fire({ title: 'Đang xử lý...', didOpen: () => { Swal.showLoading(); } });
            
            // Gọi đến API mượn sách đã xác thực
            const response = await api.post("/loans/checkout", loanPayload); 

            Swal.fire({ 
                title: "Thành công!", 
                text: `Hạn trả sách của bạn là: ${response.data.due_date}`, 
                icon: "success" 
            });

            // Xóa giỏ hàng và về trang lịch sử mượn
            dispatch(clearCart());
            navigate("/orders"); 

        } catch (error) {
            console.error("Checkout error:", error);
            Swal.fire({ 
                title: "Lỗi!", 
                text: error.response?.data?.message || "Lỗi hệ thống khi mượn sách.", 
                icon: "error" 
            });
        }
    }

    return (
        <section className="min-h-screen p-6 bg-gray-100 flex items-center justify-center font-primary text-left">
            <div className="container max-w-screen-lg mx-auto">
                <div>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-600 mb-2 uppercase tracking-tight">Xác nhận mượn sách</h2>
                        <p className="text-gray-500 mb-2">Tổng giá trị: ${totalPrice}</p>
                        <p className="text-gray-500 mb-6">Số lượng: {cartItems.length}</p>
                    </div>

                    <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                            <div className="text-gray-600 border-r border-gray-100 pr-4">
                                <p className="font-medium text-lg text-blue-600">Personal Details</p>
                                <p className="mt-2 text-xs italic">Vui lòng điền đầy đủ các thông tin cá nhân để hoàn tất thủ tục mượn sách tại thư viện.</p>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                    <div className="md:col-span-5">
                                        <label htmlFor="name" className="font-bold">Full Name</label>
                                        <input {...register("name", { required: true })} type="text" id="name" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 outline-none focus:border-blue-500" placeholder="Vũ Thế Bách" />
                                    </div>

                                    <div className="md:col-span-5">
                                        <label htmlFor="email" className="font-bold">Email Address</label>
                                        <input type="text" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-100 text-gray-500 cursor-not-allowed" disabled defaultValue={currentUser?.email} />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label htmlFor="phone" className="font-bold">Phone Number</label>
                                        <input {...register("phone", { required: true })} type="number" id="phone" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 outline-none focus:border-blue-500" placeholder="09xxxxxxx" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="duration" className="font-bold">Thời gian mượn</label>
                                        <select 
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 outline-none focus:border-blue-500 cursor-pointer"
                                        >
                                            <option value={14}>Gói 14 Ngày</option>
                                            <option value={7}>Gói 7 Ngày</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-5 mt-3">
                                        <div className="inline-flex items-center">
                                            <input 
                                                onClick={() => setIschecked(!isChecked)} 
                                                type="checkbox" id="billing_same" className="form-checkbox h-4 w-4 text-blue-600" 
                                            />
                                            <label htmlFor="billing_same" className="ml-2 text-gray-600">
                                                I agree to the <Link className='underline text-blue-600'>Terms & Conditions</Link> and <Link className='underline text-blue-600'>Privacy Policy.</Link>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-5 text-right mt-6">
                                        <button 
                                            disabled={!isChecked} 
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase tracking-wider"
                                        >
                                            Place an Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CheckoutPage;