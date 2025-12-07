const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

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
                langRestrict: 'en' // Tùy chọn: giới hạn sách tiếng Anh
            }
        });

        if (!response.data.items) {
            return [];
        }
        
        // Chuẩn hóa và Ánh xạ dữ liệu (Data Mapping)
        return response.data.items.map(item => {
            const info = item.volumeInfo;
            
            // Lấy ISBN-13 (định dạng phổ biến nhất cho sách hiện đại)
            const getIsbn13 = (arr) => arr ? arr.find(id => id.type === 'ISBN_13')?.identifier : null;
            
            return {
                // Các trường dữ liệu để Admin copy-paste
                title: info.title || 'Untitled',
                authors_suggested: info.authors ? info.authors.join(', ') : 'Unknown Author', // Tên tác giả dưới dạng CHUỖI
                publisher: info.publisher || 'N/A',
                publication_date: info.publishedDate ? info.publishedDate.substring(0, 10) : null,
                description: info.description || 'No description available.',
                cover_image_url: info.imageLinks ? info.imageLinks.thumbnail : null,
                isbn: getIsbn13(info.industryIdentifiers),
                category_name_suggested: info.categories ? info.categories[0] : 'General', // Tên thể loại gợi ý
                
                // Lưu ý: category_id, authors:[ids], price, stock_quantity phải được Admin nhập thủ công.
            };
        });

    } catch (error) {
        // Xử lý lỗi từ Google API
        console.error('Google Books API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch data from external API.');
    }
};