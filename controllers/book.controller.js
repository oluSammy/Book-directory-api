const factory = require('./factoryHandler');
const Book = require('../models/bookModel');

const { createOne, getOne, getAll, updateOne, deleteOne } = factory;

exports.createBook = createOne(Book);
exports.getBook = getOne(Book);
exports.getAllBooks = getAll(Book);
exports.updateBook = updateOne(Book);
exports.deleteBook = deleteOne(Book);
