var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");

module.exports = (req, res, next) => {
  let infusionsoftStorage = localStorage.getItem("infusionsoft");
  let infustionsoft = {
    INFUSIONSOFT_APP_ID: process.env.INFUSIONSOFT_APP_ID,
    INFUSIONSOFT_CLIENT_ID: process.env.INFUSIONSOFT_CLIENT_ID,
    INFUSIONSOFT_CLIENT_SECRET: process.env.INFUSIONSOFT_CLIENT_SECRET,
    INFUSIONSOFT_REDIRECT_URL: process.env.INFUSIONSOFT_REDIRECT_URL,
    INFUSIONSOFT_OAUTH_TOKEN: process.env.OAUTH2_TOKEN_URL,
    INFUSIONSOFT_DATABASE: process.env.APP_DB,
  };

  if (infusionsoftStorage) {
    // update if there is a value 
    infustionsoft = JSON.parse(infusionsoftStorage);
  }


  req.infusionsoft = {
    app_id: infustionsoft.INFUSIONSOFT_APP_ID,
    client_id: infustionsoft.INFUSIONSOFT_CLIENT_ID,
    client_secret: infustionsoft.INFUSIONSOFT_CLIENT_SECRET,
    redirect_url: infustionsoft.INFUSIONSOFT_REDIRECT_URL,
    oauth_token: infustionsoft.INFUSIONSOFT_OAUTH_TOKEN,
    database: infustionsoft.INFUSIONSOFT_DATABASE,
  };
  next();
};
