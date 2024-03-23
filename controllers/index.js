/**
 * @author Randy Rebucas
 * @version 0.0.9
 * ...
 */
const dbMap = {
  0: 'Empty',
  1: 'RHI',
  2: 'Soulbeat'
}
exports.index = async (req, res, next) => {
  const { code } = req.query;

  if (code) {
    res.redirect(`auth/requestAccessToken/${code}`);
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
