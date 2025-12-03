const MongoManager = require('./mongodb/MongoManager');
const PostgresManager = require('./postgresql/PostgresManager');

const dbType = process.env.DB_TYPE || 'mongodb';

let db;
if (dbType === 'mongodb') {
  db = new MongoManager();
} else if (dbType === 'postgresql') {
  db = new PostgresManager();
} else {
  throw new Error(`Unsupported DB type: ${dbType}`);
}

if (db) { db.initialize() }

module.exports = db;
