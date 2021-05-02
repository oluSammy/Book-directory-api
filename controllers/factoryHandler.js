const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/ApiFeatures');

// fuzzy search function
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document with that ID', 404));
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.query);
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

exports.search = (Model) =>
  catchAsync(async (req, res, next) => {
    const searchArr = ['title', 'subtitle', 'author', 'publisher'];
    searchArr.forEach((field) => {
      if (req.query[field]) {
        const regex = new RegExp(escapeRegex(req.query[field]), 'gi');
        delete req.query[field];
        req.query = { ...req.query, [field]: regex };
      }
    });

    const features = new ApiFeatures(Model.find({ ...req.query }), req.query)
      .sort()
      .limit()
      .pagination();

    const doc = await features.query;

    // send response
    res.status(200).json({
      message: 'success',
      results: doc.length,
      data: doc,
    });
  });
