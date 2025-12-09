// server/src/services/googleBooks.service.js (ĐÃ CẬP NHẬT ĐẦY ĐỦ LOGIC TÌM KIẾM)

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// --- HÀM HỖ TRỢ CHUẨN HÓA DỮ LIỆU ---
const normalizeBookData = (item) => {
    const info = item.volumeInfo;
    const getIsbn13 = (arr) => arr ? arr.find(id => id.type === 'ISBN_13')?.identifier : null;
    
    return {
        google_id: item.id, // RẤT QUAN TRỌNG: Lấy ID Google Books để lưu vào Review
        title: info.title || 'Untitled',
        authors_suggested: info.authors ? info.authors.join(', ') : 'Unknown Author',
        publisher: info.publisher || 'N/A',
        publication_date: info.publishedDate ? info.publishedDate.substring(0, 10) : null,
        description: info.description || 'No description available.',
        cover_image_url: info.imageLinks ? info.imageLinks.thumbnail : null,
        isbn: getIsbn13(info.industryIdentifiers),
        category_name_suggested: info.categories ? info.categories[0] : 'General',
        
        // Thêm trường cho Review/Rating (dùng cho tính năng Review)
        averageRating: info.averageRating || null,
        ratingsCount: info.ratingsCount || 0,
    };
};

// --- HÀM GỌI API CHUNG ---
const executeSearch = async (params) => {
    if (!API_KEY) {
        throw new Error('Google Books API Key is missing in .env');
    }

    try {
        const response = await axios.get(BASE_URL, { params });

        if (!response.data.items) {
            return [];
        }
        
        return response.data.items.map(normalizeBookData);
    } catch (error) {
        console.error('Google Books API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch data from external API.');
    }
};

// --- 1. HÀM TÌM KIẾM CƠ BẢN (DÙNG CHO /external/search) ---
exports.searchBooks = (query) => {
    // Sử dụng hàm chung, query được Google tự động phân tích
    const params = { q: query, key: API_KEY, maxResults: 15, langRestrict: 'en' };
    return executeSearch(params);
};

// --- 2. HÀM TÌM KIẾM NÂNG CAO (DÙNG CHO /external/advanced) ---
exports.advancedSearch = (searchParams, maxResults = 15) => {
    // Xây dựng query string dựa trên các tham số nâng cao của Google API
    
    let q = '';
    if (searchParams.title) q += `intitle:${searchParams.title}+`;
    if (searchParams.author) q += `inauthor:${searchParams.author}+`;
    if (searchParams.isbn) q += `isbn:${searchParams.isbn}+`;
    if (searchParams.publisher) q += `inpublisher:${searchParams.publisher}+`;
    if (searchParams.subject) q += `subject:${searchParams.subject}+`;
    if (searchParams.keyword) q += searchParams.keyword + '+';

    q = q.slice(0, -1); // Loại bỏ dấu '+' cuối cùng

    const params = { 
        q: q, 
        key: API_KEY, 
        maxResults, 
        orderBy: searchParams.orderBy || 'relevance',
        printType: searchParams.printType || 'all',
        langRestrict: searchParams.lang || 'en'
    };
    
    return executeSearch(params);
};

// --- 3. HÀM TÌM KIẾM THEO TÁC GIẢ (DÙNG CHO /external/author) ---
exports.searchByAuthor = (author, maxResults = 15) => {
    // Sử dụng cú pháp tìm kiếm 'inauthor:'
    const params = { q: `inauthor:${author}`, key: API_KEY, maxResults, langRestrict: 'en' };
    return executeSearch(params);
};

// --- 4. HÀM TÌM KIẾM THEO ISBN (DÙNG CHO /external/isbn) ---
exports.searchByISBN = (isbn) => {
    // Sử dụng cú pháp tìm kiếm 'isbn:'
    const params = { q: `isbn:${isbn}`, key: API_KEY, maxResults: 1 };
    return executeSearch(params);
};

// --- 5. HÀM LẤY CHI TIẾT BẰNG GOOGLE ID (DÙNG CHO /external/id/:googleId VÀ TÍNH NĂNG REVIEW) ---
exports.getBookByGoogleId = async (googleId) => {
    if (!API_KEY) {
        throw new Error('Google Books API Key is missing in .env');
    }

    try {
        const response = await axios.get(`${BASE_URL}/${googleId}`, {
            params: { key: API_KEY }
        });

        if (!response.data || response.data.error) {
            return null; // Không tìm thấy sách
        }

        // Trả về dữ liệu chi tiết đã chuẩn hóa
        return normalizeBookData(response.data);

    } catch (error) {
        console.error('Google Books API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch data from external API.');
    }
};