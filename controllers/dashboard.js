/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
const connection = require("./../db/index");

exports.index = async (req, res, next) => {
  let stats = await getStats();

  if (!stats) {
    res.status(error.status || 500);
    res.render("error");
  }

  res.render("dashboard", {
    title: "Scrapped Data.",
    subTitle: "Manage exported data.",
    infusionsoft: req.infusionsoft,
    total: Object.assign({}, stats.shift()),
  });
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
