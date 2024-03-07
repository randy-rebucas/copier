/**
 * @author Randy Rebucas
 * @version 0.0.5
 * ...
 */
const connection = require("./../db/index");

exports.index = async (req, res, next) => {
  let dbMap = {
    0: 'Empty',
    1: 'RHI',
    2: 'Soulbeat'
  }

  // get code query
  const { code } = req.query;
  // check of there is a code query
  if (code) {
    res.redirect(`auth/requestAccessToken/${code}`);
  } else if (!req.infusionsoft) {
    res.redirect("/setup");
  } else if (req.session.accessToken) {
    res.redirect("/dashboard");
  } else {

    res.render("index", {
      title: "Infusionsoft Exporter",
      infusionsoft: req.infusionsoft,
      authorizationUrl: req.getAuthorizationUrl,
      isAuthorized: req.session.accessToken ? true : false,
      database: dbMap[req.infusionsoft.database]
    });
  }
};

