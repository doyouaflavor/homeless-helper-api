const bcrypt = require('bcryptjs');
const router = require('express').Router();

const { createError } = require('../lib/utils');
const models = require('../models');

async function createDefaultUsers() {
  try {
    const admin = await models.locations.findOne({ username: 'admin' });

    if (!admin) {
      await models.users.create({
        username: 'admin',
        password: bcrypt.hashSync('admin'),
        admin: true,
      });
    }
  } catch (err) {
    return next(createError(500, null, err));
  }
}

createDefaultUsers();

module.exports = router;
