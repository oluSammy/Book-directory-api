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

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    const doc = await query;
    if (!doc) return next(new AppError('no document matched the id', 404));

    res.status(200).json({
      status: 200,
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findByIdAndDelete(req.params.id);
    const doc = await query;

    if (!doc) return next(new AppError('no document matched that id', 404));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.search = (Model) =>
  catchAsync(async (req, res, next) => {
    const searchArr = ['title', 'subtitle', 'author', 'publisher'];
    let searchQuery;
    searchArr.forEach((field) => {
      if (req.query[field]) {
        const regex = new RegExp(escapeRegex(req.query[field]), 'gi');
        delete req.query[field];
        req.query = { ...req.query };
        searchQuery = { [field]: regex };
      }
    });

    const features = new ApiFeatures(Model.find(searchQuery), req.query)
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
