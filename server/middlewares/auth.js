const jwt = require('jsonwebtoken');

const config = require('../../config');
const { createError } = require('../lib/utils');
const models = require('../models');

module.exports = function (req, res, next) {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.server.secretKey, async function (err, decoded) {
      if (err) {
        next(createError(400));
      } else {
        req.profile = await models.users.findOne({ _id: decoded.id });
        next();
      }
    });
  } else {
    next();
  }
};
