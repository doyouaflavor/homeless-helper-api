const router = require('express').Router();

const users = require('./users');
const locations = require('./locations');
const events = require('./events');

const API_ENTRY = '/api/v1';

router.use(API_ENTRY, users);
router.use(API_ENTRY, locations);
router.use(API_ENTRY, events);

module.exports = router;
