/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */

exports.index = async (req, res, next) => {
  res.render("setup/index", {
    title: "infusionsoft setup",
    subTitle: "Please enter infusionsoft developer account.",
    infusionsoft: req.infusionsoft ?? {},
    soulbeatAppId: process.env.SOULBEAT_APP_ID,
    rhiAppId: process.env.RHI_APP_ID,
    oldDatabase: req.infusionsoft.database
  });
};

exports.set = async (req, res, next) => {
  const { appId, clientId, clientSecret, redirectUrl, oAuthToken, database } = req.body;
  localStorage.setItem(
    "infusionsoft",
    JSON.stringify({
      INFUSIONSOFT_APP_ID: appId,
      INFUSIONSOFT_CLIENT_ID: clientId,
      INFUSIONSOFT_CLIENT_SECRET: clientSecret,
      INFUSIONSOFT_REDIRECT_URL: redirectUrl,
      INFUSIONSOFT_OAUTH_TOKEN: oAuthToken,
      INFUSIONSOFT_DATABASE: database,
    })
  );

  res.redirect("/");
};
