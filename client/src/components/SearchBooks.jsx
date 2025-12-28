import React, { useState } from 'react';
import { FiSearch } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const SearchBooks = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        // Chuyển hướng sang trang kết quả tìm kiếm với query parameter
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sách từ thư viện Google..."
                className="w-full bg-[#EAEAEA] py-1.5 pl-10 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
        </form>
    );
};

export default SearchBooks;