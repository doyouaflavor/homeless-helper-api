const mongoose = require('mongoose');
const forEach = require('lodash/forEach');

const schemas = require('./schemas.json');

const DB_HOST = process.env.DB_HOST || 'localhost';
const conn = mongoose.createConnection(`mongodb://${DB_HOST}:27017/homeless-helper`);
const models = {}

forEach(schemas, (value, key) => {
  const schemaObj = new mongoose.Schema(value, { versionKey: false });
  const model = conn.model(key, schemaObj);

  models[key] = model;
});

module.exports = models;
