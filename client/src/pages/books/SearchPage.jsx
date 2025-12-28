import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import BookCard from './BookCard';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await api.get(`/books/external/search?q=${query}`);
                const rawData = response.data.results || [];
                
                const formattedData = rawData.map((item, index) => {
                // 1. Tìm ID từ mọi nguồn có thể
                // Nếu không có bất kỳ ID nào, dùng index làm ID tạm thời để không bị đứng máy
                const id = item.id || item.googleId || item.book_id || `temp-id-${index}`;
    
                return {
                    book_id: String(id), 
                    title: item.title || "Untitled Book",
                    // Đảm bảo lấy được ảnh từ các cấu trúc lồng nhau của Google Books
                    cover_image_url: item.imageLinks?.thumbnail || item.imageLinks?.smallThumbnail || item.cover_image_url || "",
                    description: item.description || "Không có mô tả cho cuốn sách này.",
                    price: 0,
                    stock_quantity: 10,
                    category: Array.isArray(item.categories) ? item.categories[0] : (item.category || "General")
                };
            });

                setResults(formattedData);
            } catch (error) {
                console.error("Lỗi tìm kiếm sách ngoài:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    return (
        <div className="py-10 container mx-auto px-4 min-h-screen">
            <header className='mb-8 border-b pb-4'>
                <h2 className="text-3xl font-bold text-gray-800">Kết quả tìm kiếm</h2>
                <p className='text-gray-500 mt-2'>
                    Tìm thấy {results.length} cuốn sách cho từ khóa: 
                    <span className='font-semibold text-blue-600'> "{query}"</span>
                </p>
            </header>
            
            {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className='mt-4 text-gray-600'>Đang lùng sục kho sách...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {results.length > 0 ? (
                        results.map((book, index) => (
                            <BookCard key={book.book_id || index} book={book} />
                        ))
                    ) : (
                        <div className='col-span-full text-center py-20 bg-gray-50 rounded-lg'>
                            <p className="text-xl text-gray-500">Rất tiếc, không tìm thấy cuốn sách nào.</p>
                            <button 
                                onClick={() => window.history.back()}
                                className='mt-4 text-blue-600 hover:underline font-medium'
                            >
                                ← Quay lại trang trước
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;