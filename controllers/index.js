/**
 * @author Randy Rebucas
 * @version 0.0.9
 * ...
 */

exports.index = async (req, res, next) => {
  const { code } = req.query;

  const subdomains = ['rhi', 'soulbeat'];
  const subdomain = req.hostname.split('.').shift();

  if (!subdomains.includes(subdomain)) {
    let port = req.app.get('env') === 'development' ? `:${req.app.settings.port}` : '';
    res.redirect(`${req.protocol}://rhi.${req.hostname}${port}`);
  } else if (code) {
    res.redirect(`auth/requestAccessToken/${code}`);
  } else if (req.session.accessToken) {
    res.redirect("/dashboard");
  } else {
    let stats = await getStats(req.connection);

    if (!stats) {
      res.status(error.status || 500);
      res.render("error");
    }
    console.log(stats);

    res.render("index", {
      title: "Infusionsoft Scrapper",
      authorizationUrl: req.getAuthorizationUrl,
      subdomain: req.hostname.split('.').shift(),
      isAuthorized: req.session.accessToken ? true : false
    });
  }
};

const getStats = (connection) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT (SELECT FORMAT(COUNT(DISTINCT contact_id), 2) FROM contacts) as TotalContacts`;

    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  })
}