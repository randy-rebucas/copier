var mysql = require("mysql");

module.exports = (req, res, next) => {
    const subdomain = req.hostname.split('.').shift();

    const soulbeatDb = {
        host: process.env.SOULBEAT_HOSTNAME,
        user: process.env.SOULBEAT_USERNAME,
        password: process.env.SOULBEAT_PASSWORD,
        database: process.env.SOULBEAT_DATABASE,
        port: process.env.SOULBEAT_PORT,
    }
    const rhiDb = {
        host: process.env.RDS_HOSTNAME,
        user: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DATABASE,
        port: process.env.RDS_PORT,
    }

    const dbconnection = subdomain == 'rhi' ? rhiDb : soulbeatDb;

    var connection = mysql.createConnection(dbconnection);

    connection.connect(function (err) {
        if (err) {
            console.error(`${subdomain} database connection failed: ${err.stack}`);
            return;
        }

        console.log(`Connected to ${subdomain} databases.`);
    });

    req.connection = connection;

    next();
};