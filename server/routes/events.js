const router = require('express').Router();
const { checkSchema } = require('express-validator/check')
const stringValidator = require('validator');

const forEach = require('lodash/forEach');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const isUndefined = require('lodash/isUndefined');
const map = require('lodash/map');

const models = require('../models');
const { createError, validate, isValidId } = require('../lib/utils');
const { sendMail } = require('../lib/mailer');
const config = require('../../config');
const { GIVER_TYPES, CONTACT_TITLES } = require('../const');

const createEventsValidator = checkSchema({
  locationId: {
    custom: {
      options: async (id) => {
        if (!isString(id) || !isValidId(id)) {
          throw new Error('Unvalid format of location ID');
        }

        const result = await models.locations.findById(id);

        if (!result) {
          throw new Error('Location ID not existed');
        }
      },
    },
  },
  'giver.type': {
    isIn: {
      options: [[
        GIVER_TYPES.PERSON,
        GIVER_TYPES.ORGANIZATION,
        GIVER_TYPES.STORE,
      ]],
      errorMessage: `Giver type must be "${GIVER_TYPES.PERSON}", ` +
        `"${GIVER_TYPES.ORGANIZATION}" or "${GIVER_TYPES.STORE}"`,
    },
  },
  'giver.name': {
      exists: true,
      errorMessage: 'Giver name is required',
  },
  'giver.contactName': {
      exists: true,
      errorMessage: 'Giver contact name is required',
  },
  'giver.contactTitle': {
    isIn: {
      options: [[
        CONTACT_TITLES.MR,
        CONTACT_TITLES.MS,
      ]],
      errorMessage: `Giver type must be "${CONTACT_TITLES.MR}" or ` +
        `"${CONTACT_TITLES.MS}"`,
    },
  },
  'giver.email': {
    isEmail: true,
    errorMessage: 'Giver email format is not valid',
  },
  'giver.phone': {
      exists: true,
      errorMessage: 'Giver phone is required',
  },
  items: {
    custom: {
      options: async (items) => {
        if (!isArray(items)) {
          throw new Error('Items must be an array');
        }

        forEach(items, (item) => {
          const { date, content } = item;

          if (!isString(date) || !stringValidator.isISO8601(date)) {
            throw new Error('Item date must be a valid ISO 8601 format');
          }

          if (!isArray(content)) {
            throw new Error('Item content must be an array');
          }

          forEach(content, (food) => {
            if (!isString(food.name) || food.name.length === 0) {
              throw new Error('Item content name is required');
            }

            if (!isString(food.amount) || food.amount.length === 0) {
              throw new Error('Item content amount is required');
            }
          });
        });
      },
    },
  },
})

const checkValidIdIfExist = async (id) => {
  if (!isUndefined(id) && (!isString(id) || !isValidId(id))) {
    throw new Error('Unvalid format of location ID');
  }
}

const queryEventsValidator = checkSchema({
  locationId: {
    custom: {
      options: checkValidIdIfExist,
    },
  },
  giverd: {
    custom: {
      options: checkValidIdIfExist,
    },
  },
})

async function createEvents(req, res, next) {
  let giver;

  try {
    const { locationId, items } = req.body;

    giver = req.body.giver;

    // Insert giver record first.
    const { _id: giverId } = await models.givers.create(giver);

    // Create event objects that will be inserted.
    const created = new Date().toISOString();
    const events = map(items, ({ date, content }) => ({
      location: locationId,
      giver: giverId,
      date,
      content,
      created,
    }));

    // Insert the event objects.
    const insertedEvents = await models.events.create(events);

    // Create result object, which contains Ids of inserted events.
    const result = {
      _ids: map(insertedEvents, (insertedEvent) => insertedEvent._id)
    }

    res.send(result);
  } catch (err) {
    return next(createError(500, null, err));
  }

  if (config.mailer.enabled) {
    try {
      await sendMail(
        giver.email,
        `Thank you, ${giver.name}`,
        'Thank you',
      );
    } catch (err) {
      console.error(err);
    }
  }
}

async function queryEvents(req, res, next) {
  try {
    const { locationId, giverId } = req.body;
    const query = {}

    // Add query filters.
    if (locationId) {
      query.location = locationId;
    }
    if (giverId) {
      query.giver = giverId;
    }

    const list = await models.events.
      find(query).
      populate('location').
      populate('giver').
      exec();

    res.send(list)
  } catch (err) {
    return next(createError(500, null, err));
  }
}

router.post('/events', createEventsValidator, validate, createEvents);
router.post('/events/query', queryEventsValidator, validate, queryEvents);

module.exports = router;
