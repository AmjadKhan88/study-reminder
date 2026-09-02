const { globalSearch } = require('../services/search.service');

exports.search = async (req, res, next) => {
  try {
    const results = await globalSearch(req.userId, req.query.q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};