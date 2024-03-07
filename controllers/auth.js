/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
const request = require("request-promise");

exports.requestAccessToken = async (req, res, next) => {
  try {
    const requestBody = {
      grant_type: "authorization_code",
      code: req.params.code,
      client_id:
        req.infusionsoft.client_id ?? process.env.INFUSIONSOFT_CLIENT_ID,
      client_secret:
        req.infusionsoft.client_secret ??
        process.env.INFUSIONSOFT_CLIENT_SECRET,
      redirect_uri:
        req.infusionsoft.redirect_url ?? process.env.INFUSIONSOFT_REDIRECT_URL,
    };

    const options = {
      method: "POST",
      uri: process.env.OAUTH2_TOKEN_URL,
      form: requestBody,
      json: true,
    };

    const response = await request(options);

    req.session.accessToken = response.access_token;
    req.session.refreshToken = response.refresh_token;
    req.session.save();

    // localStorage.setItem(
    //   "tokens",
    //   JSON.stringify({
    //     ACCESS_TOKEN: response.access_token,
    //     REFRESH_TOKEN: response.refresh_token
    //   })
    // );

    res.redirect("/dashboard");
  } catch (err) {
    res.send("Error requesting access token");
  }
};

exports.refreshAccessToken = async (req, res, next) => {
  try {
    const buf = Buffer.from(
      req.infusionsoft.client_id + ":" + req.infusionsoft.client_secret
    );
    const encodedData = buf.toString("base64");

    const REQUEST_HEADERS = {
      Authorization: "Basic " + encodedData,
    };

    const queryParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: req.session.refreshToken,
    });

    const refreshAccessTokenUrl = `${process.env.OAUTH2_TOKEN_URL}?${queryParams}`;

    const options = {
      method: "POST",
      uri: refreshAccessTokenUrl,
      headers: REQUEST_HEADERS,
      json: true,
    };
    const response = await request(options);
    req.session.accessToken = response.access_token;
    req.session.refreshToken = response.refresh_token;
    req.session.save();

    localStorage.setItem(
      "tokens",
      JSON.stringify({
        ACCESS_TOKEN: response.access_token,
        REFRESH_TOKEN: response.refresh_token
      })
    );

    res.redirect("/users");
  } catch (err) {
    res.send("Error refreshing access token");
  }
};
