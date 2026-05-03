const express = require('express');
const { errorResponse } = require('../middleware/errors');

function createSearchRouter(userSearchService) {
  const router = express.Router();

  router.get('/vulnerable', (req, res, next) => {
    try {
      const username = req.query.username || '';
      const result = userSearchService.searchVulnerable(username);

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/secure', (req, res, next) => {
    try {
      const username = req.query.username || '';
      const searchResult = userSearchService.searchSecure(username);

      if (!searchResult.ok) {
        return errorResponse(
          res,
          400,
          'VALIDATION_ERROR',
          'Invalid username query parameter.',
          searchResult.errors
        );
      }

      return res.json(searchResult.result);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = {
  createSearchRouter
};
