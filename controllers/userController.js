const factory = require('./factoryHandler');
const User = require('../models/userModel');

const { getAll } = factory;

exports.getAllUsers = getAll(User);
