module.exports = (req, res, next) => {
  let port = req.app.get('env') === 'development' ? `:${req.app.settings.port}` : '';

  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: "full",
    client_id: process.env.INFUSIONSOFT_CLIENT_ID,
    redirect_uri: `${req.protocol}://${req.hostname}${port}`,
  });

  req.getAuthorizationUrl = `${process.env.OAUTH2_AUTHORIZATION_URL}?${queryParams}`;

  next();
};
