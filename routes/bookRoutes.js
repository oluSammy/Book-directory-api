const express = require('express');
const bookController = require('../controllers/book.controller');
const authController = require('../controllers/authController');

const {
  createBook,
  getBook,
  getAllBooks,
  updateBook,
  deleteBook,
} = bookController;

const { protectRoute, restrictRole } = authController;

const router = express.Router();

router.route('/').post(createBook).get(protectRoute, getAllBooks);
router
  .route('/:id')
  .get(getBook)
  .patch(updateBook)
  .delete(protectRoute, restrictRole('admin'), deleteBook);

module.exports = router;
