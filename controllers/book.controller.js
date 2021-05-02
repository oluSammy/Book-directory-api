const factory = require('./factoryHandler');
const Book = require('../models/bookModel');

const { createOne, getOne, getAll } = factory;

exports.createBook = createOne(Book);
exports.getBook = getOne(Book);
exports.getAllBooks = getAll(Book);
