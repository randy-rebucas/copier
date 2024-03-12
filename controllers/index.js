/**
 * @author Randy Rebucas
 * @version 0.0.5
 * ...
 */
const store = require("store2");
const connection = require("../db");

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
  } else if (!store('appId')) {
    res.redirect("/setup");
  } else if (req.session.accessToken) {
    res.redirect("/dashboard");
  } else {
    // connection = req.mysql;
    let r = await getStats();
    console.log(r);
    res.render("index", {
      title: "Infusionsoft Exporter",
      infusionsoft: req.infusionsoft,
      authorizationUrl: req.getAuthorizationUrl,
      isAuthorized: req.session.accessToken ? true : false,
      database: dbMap[req.infusionsoft.database]
    });
  }
};

const getStats = () => {
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