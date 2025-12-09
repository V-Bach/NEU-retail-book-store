const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Hàm chuẩn hóa và ánh xạ dữ liệu từ Google Books API
 * @param {Array} items - Mảng các item từ Google Books API
 * @returns {Array} Mảng các đối tượng sách đã được chuẩn hóa
 */
const normalizeBookData = (items) => {
    if (!items) return [];
    
    return items.map(item => {
        const info = item.volumeInfo;
        
        // Lấy ISBN-13 (định dạng phổ biến nhất cho sách hiện đại)
        const getIsbn13 = (arr) => arr ? arr.find(id => id.type === 'ISBN_13')?.identifier : null;
        
        return {
            // Các trường dữ liệu để Admin copy-paste
            title: info.title || 'Untitled',
            authors_suggested: info.authors ? info.authors.join(', ') : 'Unknown Author',
            publisher: info.publisher || 'N/A',
            publication_date: info.publishedDate ? info.publishedDate.substring(0, 10) : null,
            description: info.description || 'No description available.',
            cover_image_url: info.imageLinks ? info.imageLinks.thumbnail : null,
            isbn: getIsbn13(info.industryIdentifiers),
            category_name_suggested: info.categories ? info.categories[0] : 'General',
            google_books_id: item.id, // Thêm ID từ Google Books
            page_count: info.pageCount || null,
            language: info.language || 'en',
            
            // Lưu ý: category_id, authors:[ids], price, stock_quantity phải được Admin nhập thủ công.
        };
    });
};

/**
 * Hàm tìm kiếm sách và chuẩn hóa kết quả từ Google Books API.
 * @param {string} query - Chuỗi tìm kiếm (title, author, ISBN).
 * @returns {Promise<Array>} Mảng các đối tượng sách đã được chuẩn hóa.
 */
exports.searchBooks = async (query) => {
    if (!API_KEY) {
        throw new Error('Google Books API Key is missing in .env');
    }

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: query,
                key: API_KEY,
                maxResults: 15,
                langRestrict: 'en'
            }
        });

        return normalizeBookData(response.data.items);
    } catch (error) {
        console.error('Google Books API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch data from external API.');
    }
};

/**
 * Hàm tìm kiếm nâng cao với nhiều tiêu chí
 * @param {Object} params - Đối tượng chứa các tiêu chí tìm kiếm
 * @param {string} params.title - Tiêu đề sách
 * @param {string} params.author - Tên tác giả
 * @param {string} params.isbn - ISBN
 * @param {string} params.publisher - Nhà xuất bản
 * @param {string} params.subject - Chủ đề
 * @param {string} params.keyword - Từ khóa chung
 * @param {number} maxResults - Số lượng kết quả tối đa
 * @returns {Promise<Array>} Mảng các đối tượng sách đã được chuẩn hóa
 */
exports.advancedSearch = async (params, maxResults = 15) => {
    if (!API_KEY) {
        throw new Error('Google Books API Key is missing in .env');
    }

    try {
        // Xây dựng query string từ các tham số
        let queryParts = [];
        
        if (params.title) queryParts.push(`intitle:${params.title}`);
        if (params.author) queryParts.push(`inauthor:${params.author}`);
        if (params.isbn) queryParts.push(`isbn:${params.isbn}`);
        if (params.publisher) queryParts.push(`inpublisher:${params.publisher}`);
        if (params.subject) queryParts.push(`subject:${params.subject}`);
        if (params.keyword) queryParts.push(params.keyword);
        
        // Nếu không có tiêu chí nào, sử dụng tìm kiếm chung
        const query = queryParts.length > 0 ? queryParts.join('+') : 'books';
        
        const response = await axios.get(BASE_URL, {
            params: {
                q: query,
                key: API_KEY,
                maxResults: maxResults,
                orderBy: params.orderBy || 'relevance',
                printType: params.printType || 'all',
                langRestrict: params.lang || 'en'
            }
        });

        return normalizeBookData(response.data.items);
    } catch (error) {
        console.error('Google Books API Error (Advanced Search):', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch data from external API.');
    }
};

/**
 * Hàm tìm kiếm sách theo ID từ Google Books
 * @param {string} bookId - ID của sách trên Google Books
 * @returns {Promise<Object>} Thông tin chi tiết của sách
 */
exports.getBookByGoogleId = async (bookId) => {
    if (!API_KEY) {
        throw new Error('Google Books API Key is missing in .env');
    }

    try {
        const response = await axios.get(`${BASE_URL}/${bookId}`, {
            params: {
                key: API_KEY
            }
        });

        // Chuẩn hóa dữ liệu từ một item
        const normalizedData = normalizeBookData([response.data]);
        return normalizedData[0] || null;
    } catch (error) {
        console.error('Google Books API Error (Get by ID):', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch book details from external API.');
    }
};

/**
 * Hàm tìm kiếm sách theo tác giả cụ thể
 * @param {string} authorName - Tên tác giả
 * @param {number} maxResults - Số lượng kết quả tối đa
 * @returns {Promise<Array>} Mảng các đối tượng sách đã được chuẩn hóa
 */
exports.searchByAuthor = async (authorName, maxResults = 15) => {
    return this.advancedSearch({ author: authorName }, maxResults);
};

/**
 * Hàm tìm kiếm sách theo ISBN
 * @param {string} isbn - ISBN của sách
 * @returns {Promise<Array>} Mảng các đối tượng sách đã được chuẩn hóa
 */
exports.searchByISBN = async (isbn) => {
    return this.advancedSearch({ isbn: isbn }, 5);
};