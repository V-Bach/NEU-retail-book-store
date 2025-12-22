import React, { useState, useEffect } from 'react'
import BookCard from '../books/BookCard'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import api from '../../utils/api'; 

const Categories = ["Chọn Thể Loại", "Maths", "Technology", "Economics", "Social"]

const TopSeller = () => {
    // Luôn khởi tạo là mảng trống [] để tránh lỗi .map() ban đầu
    const [books, setBooks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Chọn Thể Loại");

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books'); 
                
                // KIỂM TRA CẤU TRÚC DỮ LIỆU TỪ BACKEND
                if (Array.isArray(response.data)) {
                    // Nếu BE trả về: [{}, {}, {}]
                    setBooks(response.data); 
                } else if (response.data && Array.isArray(response.data.books)) {
                    // Nếu BE trả về: { books: [{}, {}, {}] }
                    setBooks(response.data.books);
                } else {
                    console.error("Dữ liệu trả về không phải mảng:", response.data);
                    setBooks([]); 
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách sách từ BE:", error);
                setBooks([]); 
            }
        };
        fetchBooks();
    }, [])

    // Đảm bảo filteredBooks luôn là mảng trước khi render
    const safeBooks = Array.isArray(books) ? books : [];
    
    const filteredBooks = selectedCategory === "Chọn Thể Loại" 
        ? safeBooks 
        : safeBooks.filter(book => book.category?.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <div className='py-10'>
            <h2 className='text-3xl font-semibold mb-6'>Top Sellers</h2>

            {/* Categories */}
            <div className='mb-8 flex items-center'>
                <select 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    className='border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none'
                > 
                    {Categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            <Swiper
                slidesPerView={1}
                spaceBetween={10}
                navigation={true}
                breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 40 },
                    1024: { slidesPerView: 2, spaceBetween: 50 },
                }}
                modules={[Navigation]}
                className="mySwiper"
            >
                {/* Kiểm tra length trước khi map để an toàn tuyệt đối */}
                {filteredBooks.length > 0 ? (
                    filteredBooks.map((book, index) => (
                        <SwiperSlide key={index}>
                            <BookCard book={book} />
                        </SwiperSlide>
                    ))
                ) : (
                    <p className="text-center py-10 text-gray-500">Không tìm thấy sách nào.</p>
                )}
            </Swiper>
        </div>
    )
}

export default TopSeller