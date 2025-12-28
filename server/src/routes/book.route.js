const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware'); 

// Đảm bảo import bookController ở đầu file
router.post('/external/sync', bookController.syncExternalBook);

// --- CÁC ROUTE TÌM KIẾM API NGOÀI (Phải đặt TRÊN route /:id) ---

// GET /api/books/external/search?q=query
router.get('/external/search', bookController.searchExternalBooks);

// GET /api/books/external/advanced
router.get('/external/advanced', bookController.advancedExternalSearch);

// GET /api/books/external/author
router.get('/external/author', bookController.searchExternalByAuthor);

// GET /api/books/external/isbn
router.get('/external/isbn', bookController.searchExternalByISBN);

// GET /api/books/external/id/:googleId
router.get('/external/id/:googleId', bookController.getExternalBookById);


// --- CÁC ROUTE DATABASE NỘI BỘ ---

// GET /api/books
router.get('/', bookController.getAllBooks);

// GET /api/books/:id (Bây giờ nó sẽ không bị tranh chấp với /external nữa)
router.get('/:id', bookController.getBookById);

// --- CÁC ROUTE CẦN QUYỀN ADMIN ---

router.post('/', authenticate, isAdmin, bookController.createBook); 
router.put('/:id', authenticate, isAdmin, bookController.updateBook); 
router.delete('/:id', authenticate, isAdmin, bookController.deleteBook); 

module.exports = router;