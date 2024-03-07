module.exports = (req, res, next) => {
  req.infusionsoft = {
    app_id: req.session.appId ?? process.env.INFUSIONSOFT_APP_ID,
      client_id: req.session.clientId  ?? process.env.INFUSIONSOFT_CLIENT_ID,
      client_secret: req.session.clientSecret ?? process.env.INFUSIONSOFT_CLIENT_SECRET,
      redirect_url: req.session.redirectUrl ?? process.env.INFUSIONSOFT_REDIRECT_URL,
      oauth_token: req.session.oAuthToken ?? process.env.OAUTH2_TOKEN_URL,
      database: req.session.database ?? process.env.BASE_DATABASE
  };
  next();
};
