import React, { useState, useEffect } from 'react'
import BookCard from '../books/BookCard'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

// MẢNG DỮ LIỆU TĨNH - Đảm bảo giao diện luôn hiển thị
const MOCK_BOOKS = [
    {
        book_id: 1,
        title: "Calculus: Early Transcendentals",
        category: "Maths",
        cover_image_url: "https://m.media-amazon.com/images/I/91D9P9T87SL.jpg",
        description: "Cuốn sách giáo khoa kinh điển về giải tích cho sinh viên đại học.",
        price: 0,
        stock_quantity: 10
    },
    {
        book_id: 2,
        title: "Linear Algebra and Its Applications",
        category: "Maths",
        cover_image_url: "https://m.media-amazon.com/images/I/81B43S3WstL._AC_UF1000,1000_QL80_.jpg",
        description: "Kiến thức nền tảng về đại số tuyến tính trong khoa học dữ liệu.",
        price: 0,
        stock_quantity: 5
    },
    {
        book_id: 3,
        title: "React Key Concepts",
        category: "Technology",
        cover_image_url: "https://m.media-amazon.com/images/I/71uM6K+-9ML._AC_UF1000,1000_QL80_.jpg",
        description: "Học cách xây dựng ứng dụng web hiện đại với React.",
        price: 0,
        stock_quantity: 15
    },
    {
        book_id: 4,
        title: "Clean Code",
        category: "Technology",
        cover_image_url: "https://m.media-amazon.com/images/I/41xShlnTZTL.jpg",
        description: "Cẩm nang viết code sạch và bảo trì mã nguồn tốt hơn.",
        price: 0,
        stock_quantity: 8
    }
];

const TopSeller = () => {
    // Khởi tạo state bằng dữ liệu tĩnh thay vì mảng rỗng
    const [books, setBooks] = useState(MOCK_BOOKS);
    const [loading, setLoading] = useState(false); // Tắt loading để hiện ngay

    const getBooksByCat = (catName) => {
        return books.filter(book => {
            const currentCat = typeof book.category === 'object' ? book.category?.name : book.category;
            return currentCat?.toString().toLowerCase() === catName.toLowerCase();
        }).slice(0, 4); 
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className='py-10 space-y-12'>
            {/* MỤC 1: HIỆN TẤT CẢ SÁCH */}
            <div className="category-section">
                <h2 className='text-2xl font-bold mb-6 border-l-4 border-yellow-500 pl-4 text-gray-800'>
                    Recommended books ({books.length})
                </h2>
                {books.length > 0 ? (
                    <Swiper
                        slidesPerView={1} spaceBetween={20} navigation={true}
                        breakpoints={{ 640: { slidesPerView: 1 }, 1024: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }}
                        modules={[Navigation]} className="mySwiper"
                    >
                        {books.map((book) => (
                            <SwiperSlide key={book.book_id}>
                                <BookCard book={book} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <div className="p-10 bg-red-50 text-red-500 rounded-lg border border-red-200">
                        ALERT: CAN NOT FIND ANY BOOKS
                    </div>
                )}
            </div>

            {/* MỤC 2: PHÂN LOẠI */}
            {["Maths", "Technology"].map((cat) => {
                const catBooks = getBooksByCat(cat);
                return catBooks.length > 0 && (
                    <div key={cat} className="category-section">
                        <h2 className='text-xl font-bold mb-4 border-l-4 border-blue-500 pl-4'>{cat}</h2>
                        <Swiper 
                            slidesPerView={1} 
                            spaceBetween={20} 
                            navigation={true} 
                            breakpoints={{ 640: { slidesPerView: 1 }, 1024: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }}
                            modules={[Navigation]}
                        >
                            {catBooks.map(book => (
                                <SwiperSlide key={book.book_id}><BookCard book={book} /></SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                );
            })}
        </div>
    )
}

export default TopSeller;