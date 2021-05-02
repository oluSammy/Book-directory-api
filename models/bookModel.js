const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is missing'],
    trim: true,
  },
  subtitle: {
    type: String,
  },
  author: {
    type: String,
    required: [true, 'A Book must have an author'],
    maxLength: [50, `author's name cannot exceed 40 characters`],
  },
  coAuthor: {
    type: String,
  },
  publisher: {
    type: String,
    required: [true, 'please specify book publisher'],
  },
  pages: {
    type: Number,
    required: [true, 'number of pages must be specified'],
  },
  description: {
    type: String,
    required: [true, 'A Book must have a description'],
  },
  published: {
    type: Date,
    required: ['true', 'A tour must have a published date'],
  },
  isbn: {
    type: String,
    minLength: [10, 'An ISBN number should not be less than 10 characters'],
    maxLength: [13, 'An ISBN number should not be more than 13 characters'],
    unique: [true, `A book with ${this.isbn} already exists`],
    required: [true, 'An ISBN number is required'],
  },
  category: {
    type: [{ type: String }],
    required: ['true', 'A book must have a genre'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedOn: Date,
  rating: {
    type: Number,
    min: [1, 'A rating cannot be less than one'],
  },
  website: {
    type: String,
  },
});

// Query Middleware

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
