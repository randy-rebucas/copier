/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
const request = require("request-promise");
var querystring = require("querystring");
const connection = require("./../db/index");

exports.index = async (req, res, next) => {
  res.render("contact/index", {
    title: "Contacts"
  });
};

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