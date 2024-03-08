module.exports = (req, res, next) => {
  const queryParams = new URLSearchParams({
    response_type: "code",
    scope: "full",
    client_id: process.env.INFUSIONSOFT_CLIENT_ID,
    redirect_uri: rocess.env.INFUSIONSOFT_REDIRECT_URL,
  });

  req.getAuthorizationUrl = `${process.env.OAUTH2_AUTHORIZATION_URL}?${queryParams}`;

  next();
};
