const Book = require('../models/bookModel');
// const catchAsync = require('../utils/catchAsync');
const { search } = require('./factoryHandler');

// fuzzy search feature
exports.searchDocs = search(Book);
