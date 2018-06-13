const router = require('express').Router();
const { checkSchema } = require('express-validator/check')
const stringValidator = require('validator');

const forEach = require('lodash/forEach');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const map = require('lodash/map');

const models = require('../models');
const { createError, validate, isValidId } = require('../lib/utils');
const { GIVER_TYPES, CONTACT_TITLES } = require('../const');

const createEventsValidator = checkSchema({
  locationId: {
    custom: {
      options: async (id) => {
        if (!isValidId(id)) {
          throw new Error('Location ID format is not valid');
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

async function createEvents(req, res, next) {
  try {
    const { locationId, giver, items } = req.body;

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
}

router.post('/events', createEventsValidator, validate, createEvents);

module.exports = router;
