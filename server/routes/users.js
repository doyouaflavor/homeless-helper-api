const bcrypt = require('bcryptjs');
const router = require('express').Router();
const jwt = require('jsonwebtoken');

const config = require('../../config');
const { createError } = require('../lib/utils');
const models = require('../models');

async function createDefaultUsers() {
  try {
    const admin = await models.users.findOne({ username: 'admin' });

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

async function createUser(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await models.users.findOne({ username });
    if (user) {
      next(createError(400));
    } else {
      const user = await models.users.create({
        username,
        password: bcrypt.hashSync(password),
      });
      res.send({
        id: user._id,
        username: user.username,
        admin: user.admin,
        token: jwt.sign({ id: user._id }, config.server.secretKey),
      });
    }
  } catch (err) {
    next(createError(500, null, err));
  }
}

async function authenticateUser(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await models.users.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      next(createError(400));
    } else {
      res.send({
        id: user._id,
        username: user.username,
        admin: user.admin,
        token: jwt.sign({ id: user._id }, config.server.secretKey),
      });
    }
  } catch (err) {
    next(createError(500, null, err));
  }
}

async function getProfile(req, res, next) {
  try {
    if (!req.profile) {
      next(createError(401));
    }

    res.send({
      id: req.profile._id,
      username: req.profile.username,
      admin: req.profile.admin,
    });
  } catch (err) {
    next(createError(500, null, err));
  }
}

async function changePassword(req, res, next) {
  if (!req.profile) {
    next(createError(401));
  }
  console.log(req.profile);

  try {
    const { oldPassword, newPassword } = req.body;
    const user = await models.users.findOne({ _id: req.profile._id });
    if (!user) {
      next(createError(401));
      return;
    }
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      next(createError(400));
      return;
    }

    await models.users.updateOne({ _id: req.profile._id }, {
      password: bcrypt.hashSync(newPassword),
    });
    res.send({
      status: 'ok',
    });
  } catch (err) {
    next(createError(500, null, err));
  }
}

createDefaultUsers();

router.post('/users/register', createUser);
router.post('/users/login', authenticateUser);
router.get('/users/me', getProfile);
router.post('/users/chpasswd', changePassword);

module.exports = router;
