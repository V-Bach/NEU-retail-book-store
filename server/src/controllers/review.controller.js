const { Review, User } = require('../models/index');
const googleBooksService = require('../services/googleBooks.service');

exports.createReview = async (req, res) => {
    const userId = req.user ? req.user.id : 1;
    const { google_book_id , rating, comment } = req.body;

    if(!google_book_id || !userId) {
        return res.status(400).json({ message: 'Book ID and User ID are required' });
    }

    if(rating && (rating < 0 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    try {
        const newReview = await Review.create({
            google_book_id,
            user_id: userId,
            rating,
            comment
        });
        res.status(201).json({
            message: 'Review submitted successfully',
            review: newReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error: could not submit review' });
    }
};

exports.getCombinedReviews = async (req, res) => {
    const { googleId } = req.params;

    try {
        const [externalBookData, localReviews] = await Promise.all ([
            googleBooksService.getBookByGoogleId(googleId),

            Review.findAll({
                where: { google_book_id: googleId },
                order: [['createAt', 'DESC']]
            })
        ]);

        if(!externalBookData) {
            return res.status(404).json({ message: `Book with Google ID ${googleId}` });
        }

        res.status(200).json({
            google_book_id: googleId,
            book_title: externalBookData.title,
            external_average_rating: externalBookData.averageRating,
            external_ratings_count: externalBookData.ratingsCount,
            
            // Dữ liệu Local (User Reviews)
            local_reviews_count: localReviews.length,
            local_reviews: localReviews,
        });
    } catch (error) {
        console.error('Error fetching combined reviews:', error);
        res.status(500).json({ message: 'Server error: could not retrieve reviews.' });
    }
};