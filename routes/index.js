const router = require('express').Router();

const locations = require('./locations');

const API_ENTRY = '/api/v1';

router.use(API_ENTRY, locations);

module.exports = router;
