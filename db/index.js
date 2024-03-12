require("dotenv").config();
const store = require("store2");
var mysql = require("mysql");

let dbMap = {
  '0': 'Empty',
  '1': 'RHI',
  '2': 'Soulbeat'
}

const soulbeatDb = {
  host: process.env.SOULBEAT_HOSTNAME,
  user: process.env.SOULBEAT_USERNAME,
  password: process.env.SOULBEAT_PASSWORD,
  database: process.env.SOULBEAT_DATABASE,
  port: process.env.SOULBEAT_PORT,
  queryTimeout: 6000,
  connectTimeout: 60000,
}

const rhiDb = {
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: process.env.RDS_PORT,
  queryTimeout: 6000,
  connectTimeout: 60000,
}

var connection = mysql.createConnection(store('database') == 1 ? rhiDb : soulbeatDb);
// scrapper
connection.connect(function (err) {
  if (err) {
    console.error(`${dbMap[store('database')]} database connection failed: ${err.stack}`);
    return;
  }

  console.log(`Connected to ${dbMap[store('database')]} databases.`);
});
module.exports = connection;

