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
    let stats = await getStats(req.connection);

    if (!stats) {
      res.status(error.status || 500);
      res.render("error");
    }
    console.log(stats);

    res.render("index", {
      title: "Infusionsoft Exporter",
      authorizationUrl: req.getAuthorizationUrl,
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