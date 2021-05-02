const express = require('express');
const searchController = require('../controllers/searchController');

const { searchDocs } = searchController;

const router = express.Router();

router.route('/').get(searchDocs);

module.exports = router;
