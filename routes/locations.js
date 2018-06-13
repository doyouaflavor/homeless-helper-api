const router = require('express').Router();

const { createError } = require('../lib/utils');
const models = require('../models');

async function getAllLocations(req, res, next) {
  try {
    const result = await models.locations.find({});

    return res.send(result)
  } catch (err) {
    return next(createError(500, null, err));
  }
}

async function createDefaultLocations() {
  try {
    const taipeiStation = await models.locations.findOne({ name: '台北車站' });

    if (!taipeiStation) {
      await models.locations.create({
        name: '台北車站',
        longitude: 121.517315,
        latitude: 25.047908,
      });
    }
  } catch (err) {
    return next(createError(500, null, err));
  }
}

// TODO(Su JiaKuan): Currently, the locations are created by default. We should
// add API to let some users create locations on demand.
createDefaultLocations();

router.get('/locations', getAllLocations);

module.exports = router;
