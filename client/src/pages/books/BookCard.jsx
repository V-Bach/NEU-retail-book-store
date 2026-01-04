import React from 'react'
import { FiShoppingCart } from "react-icons/fi";
import { getImgUrl } from '../../utils/getImgUrl'; 
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import api from '../../utils/api';

const BookCard = ({ book }) => {
    const dispatch = useDispatch();

    // lấy URL ảnh (hàm getImgUrl mới sẽ lo việc xử lý sách thiếu ảnh)
    const finalSrc = getImgUrl(book?.cover_image_url || book?.image);

    const handleBorrowClick = async (currentBook) => {
        try {
            let finalBookId = currentBook.book_id || currentBook.id;

            if (isNaN(finalBookId)) {
                const syncRes = await api.post('/books/external/sync', {
                    title: currentBook.title,
                    description: currentBook.description || "",
                    cover_image_url: currentBook.cover_image_url || "",
                    category: typeof currentBook.category === 'string' ? currentBook.category : 'General'
                });
                finalBookId = syncRes.data.book_id; 
            }

            const normalizedProduct = {
                ...currentBook,
                book_id: String(finalBookId), 
                title: currentBook.title
            };

            dispatch(addToCart(normalizedProduct));
        } catch (error) {
            console.error("Lỗi mượn sách:", error);
        }
    };

    return (
        <div className=" rounded-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Khu vực ảnh: Thêm bg-gray-100 để các ảnh không màu nền hiện đẹp hơn */}
                <div className="sm:h-72 sm:w-48 sm:flex-shrink-0 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Link to={`/books/${book.book_id || book.id}`}>
                        <img
                            src={finalSrc}
                            alt={book?.title}
                            className="w-full h-full object-contain p-2 cursor-pointer hover:scale-105 transition-all duration-200"
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/150x220?text=No+Image'; 
                            }}
                        />
                    </Link>
                </div>

                {/* Khu vực nội dung: Giữ nguyên Flex-1 để chiếm hết phần còn lại */}
                <div className="flex-1">
                    <Link to={`/books/${book.book_id || book.id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-3 line-clamp-2">
                            {book?.title}
                        </h3>
                    </Link>
                    <p className="text-gray-600 mb-5 line-clamp-3 text-sm">
                        {book?.description?.length > 80 ? `${book.description.slice(0, 80)}...` : book?.description}
                    </p>
                    <p className="font-medium mb-5">
                        ${book?.price} 
                        <span className="line-through font-normal ml-2 text-gray-400">
                            $ {book?.oldPrice || '2000'}
                        </span>
                    </p>
                    <button 
                        onClick={() => handleBorrowClick(book)}
                        className="btn-primary px-6 space-x-1 flex items-center gap-1 ">
                        <FiShoppingCart />
                        <span>Borrow</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard;