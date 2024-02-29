require("dotenv").config();
var mysql = require("mysql");
var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");

let infusionsoftStorage = localStorage.getItem("infusionsoft");
let infustionsoft = {
  INFUSIONSOFT_APP_ID: '',
  INFUSIONSOFT_CLIENT_ID: '',
  INFUSIONSOFT_CLIENT_SECRET: '',
  INFUSIONSOFT_REDIRECT_URL: '',
  INFUSIONSOFT_OAUTH_TOKEN: '',
  INFUSIONSOFT_DATABASE: '',
};

if (infusionsoftStorage) {
  // update if there is a value 
  infustionsoft = JSON.parse(infusionsoftStorage);
}

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

var connection = mysql.createConnection(infustionsoft.INFUSIONSOFT_DATABASE == 1 ? rhiDb : soulbeatDb);
// scrapper
connection.connect(function (err) {
  if (err) {
    console.error(`${dbMap[infustionsoft.INFUSIONSOFT_DATABASE]} database connection failed: ${err.stack}`);
    return;
  }

  console.log(`Connected to ${dbMap[infustionsoft.INFUSIONSOFT_DATABASE]} database.`);
});
module.exports = connection;

