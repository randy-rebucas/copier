/**
 * @author Randy Rebucas
 * @version 0.0.1
 * ...
 */
const request = require("request-promise");

exports.index = async (req, res, next) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
      json: true,
    };
    const response = await request.get(
      `${process.env.BASE_URL}/users`,
      options
    );

    res.render("user", {
      title: "User",
      users: response.users,
    });
  } catch (err) {
    res.send("Error retrieving users");
  }
};


exports.profile = async (req, res, next) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.session.accessToken}`,
      },
      json: true,
    };

    const response = await request.get(
      `${process.env.BASE_URL}/account/profile`,
      options
    );

    res.render("user/profile", {
      title: "User",
      user: response,
    });
  } catch (err) {
    res.send("Error retrieving user info");
  }
};