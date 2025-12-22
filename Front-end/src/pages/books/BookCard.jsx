import React from 'react'
import { FiShoppingCart } from "react-icons/fi";
import { getImgUrl } from '../../utils/getImgUrl';
import { Link } from 'react-router-dom';
import api from '../../utils/api'; 

const BookCard = ({ book }) => {

    const handleBorrow = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Bạn cần đăng nhập để thực hiện mượn sách!");
                return;
            }

            // Gọi API thêm vào giỏ mượn
            // BE của bạn nhận: { book_id, quantity, is_borrowing }
            const response = await api.post('/cart', {
                book_id: book.book_id, // Lấy đúng book_id từ Model
                quantity: 1,
                is_borrowing: true 
            });

            if (response.status === 200 || response.status === 201) {
                alert(`Đã thêm cuốn "${book.title}" vào giỏ mượn!`);
            }
        } catch (error) {
            console.error("Lỗi mượn sách:", error);
            alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
        }
    };

    return (
        <div className="rounded-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:h-72 sm:justify-center gap-4">
                <div className="sm:h-72 sm:flex-shrink-0 border rounded-md">
                    {/* Link theo book_id mới */}
                    <Link to={`/books/${book.book_id}`}>
                        <img
                            src={`${getImgUrl(book?.cover_image_url)}`} // Dùng đúng cover_image_url
                            alt={book?.title}
                            className="w-full bg-cover p-2 rounded-md cursor-pointer hover:scale-105 transition-all duration-200"
                        />
                    </Link>
                </div>

                <div>
                    <Link to={`/books/${book.book_id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-3">
                            {book?.title}
                        </h3>
                    </Link>
                    <p className="text-gray-600 mb-5">
                        {book?.description?.length > 80 ? `${book.description.slice(0, 80)}...` : book?.description}
                    </p>
                    <p className="font-medium mb-5 text-blue-600">
                        Giá: {Number(book.price) === 0 ? "Miễn phí" : `$${book.price}`} 
                        <span className="ml-2 text-sm text-gray-400 font-normal">
                            (Còn {book.stock_quantity} cuốn)
                        </span>
                    </p>
                    
                    <button 
                        onClick={handleBorrow}
                        className="btn-primary px-6 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-md transition-colors"
                    >
                        <FiShoppingCart />
                        <span>Mượn Sách</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard