const store = require("store2");

module.exports = (req, res, next) => {

  req.infusionsoft = {
    app_id: store('appId') ?store('appId') : process.env.INFUSIONSOFT_APP_ID,
    database: store('database') ? store('database') : process.env.BASE_DATABASE
  };
  next();
};
