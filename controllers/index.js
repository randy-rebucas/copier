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
  } else if (req.session.accessToken) {
    res.redirect("/dashboard");
  } else {
    // connection = req.mysql;
    // let r = await checkLastLog();
    // let r = await createLog(1234);
    // console.log(r);
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

const checkLastLog = async () => {
  return new Promise((resolve, reject) => {
    return connection.query(
      `SELECT EXISTS(SELECT * from logs WHERE 'offset'=? AND type='contacts') AS isExistOffset`,
      [(88 - 1) * 1000],
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(Object.assign({}, results.shift()).isExistOffset)
      });
  });
}

const createLog = (lastId) => {
  return new Promise((resolve, reject) => {
    var log = { offset: 1000, last_id: lastId, type: 'contacts' };
    return connection.query(
      `INSERT INTO logs SET ?`,
      log,
      (error, rows) => {
        if (error) {
          reject(error);
        }
        resolve(rows)
      }
    );
  });
}