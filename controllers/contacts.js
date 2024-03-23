/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
const request = require("request-promise");
var querystring = require("querystring");
const connection = require("./../db/index");

exports.index = async (req, res, next) => {
  try {
    let orderColumnIndex = req.query.order[0].column;
    let orderColumn = req.query.columns[orderColumnIndex].data;
    let orderDirection = req.query.order[0].dir;
    let limit = req.query.length;
    let offset = req.query.start;
    let search = req.query.search;
    // queryParams.append("order", orderColumn);
    // queryParams.append(
    //   "order_direction",
    //   orderDirection === "asc" ? "DESCENDING" : "ASCENDING"
    // );

    let contactResponse = await getContacts(limit, offset, search, orderColumn, orderDirection);
    let countResponse = await getContactsCount();

    const object = {
      draw: req.query.draw,
      recordsTotal: Number(Object.values(countResponse)[0].count.replace(/[^0-9\.-]+/g, "")),
      recordsFiltered: Number(Object.values(countResponse)[0].count.replace(/[^0-9\.-]+/g, "")),
      data: contactResponse,
    };
    res.json(object);
  } catch (err) {
    res.send("Error retrieving contacts");
  }
};

const getContacts = (limit, offset, search, column, direction) => {

  return new Promise((resolve, reject) => {
    let query = `SELECT 
    contact_id as id,
    email_opted_in,
    last_updated,
    date_created,
    owner_id,
    given_name,
    middle_name,
    family_name,
    CONCAT_WS(' ',given_name, family_name) as full_name,
    email_status,
    ScoreValue as score_value,
    company,
    email_addresses,
    addresses,
    phone_numbers
    FROM contacts`;
    if (search.hasOwnProperty('value')) {
      query += ` WHERE given_name LIKE '%${search.value}%'`;
    }
    if (column) {
      query += ` ORDER BY ${column} ${direction === "asc" ? "ASC" : "DESC"}`;
    }
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    console.log(query);
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  })
}

const getContactsCount = () => {
  return new Promise((resolve, reject) => {
    let query = `SELECT (SELECT FORMAT(COUNT(DISTINCT contact_id), 2) FROM contacts) as count`;
    return connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results)
    });
  })
}

exports.getAll = async (req, res, next) => {
  try {
    let orderColumn = req.query.order[0].column;
    let orderDirection = req.query.order[0].dir;
    let columnName = req.query.columns[orderColumn].data;

    const queryParams = new URLSearchParams({
      limit: req.query.length,
      offset: req.query.start,
    });

    queryParams.append("order", columnName);
    queryParams.append(
      "order_direction",
      orderDirection === "asc" ? "DESCENDING" : "ASCENDING"
    );

    if (req.query.search) {
      queryParams.append("family_name", req.query.search.value);
    }

    const options = {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
      json: true,
    };
    const response = await request.get(
      `${process.env.BASE_URL}/contacts/?${queryParams}`,
      options
    );

    const object = {
      draw: req.query.draw,
      recordsTotal: response.count,
      recordsFiltered: response.count,
      data: response.contacts,
    };
    res.json(object);
  } catch (err) {
    res.send("Error retrieving contacts");
  }
};

exports.getOne = async (req, res, next) => {
  try {
    query_params = {};

    const options = {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
      json: true,
    };
    const response = await request.get(
      `${process.env.BASE_URL}/contacts/${req.params.id}`,
      options
    );
    res.json(response);
  } catch (err) {
    res.send("Error retrieving contacts");
  }
};