const express = require('express');
const bookController = require('../controllers/book.controller');

const { createBook, getBook, getAllBooks } = bookController;

const router = express.Router();

router.route('/').post(createBook).get(getAllBooks);
router.route('/:id').get(getBook);

module.exports = router;
