const request = require("request-promise");

exports.getContacts = async (req, res, next) => {
    const options = {
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`,
        },
        json: true
    };

    const response = await request.get(
        `${process.env.BASE_URL}/contacts`,
        options
    );

    res.json({ count: response.count });
}

exports.getUserProfile = async (req, res, next) => {
    const options = {
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`,
        },
        json: true
    };
    
    const response = await request.get(
        `${process.env.BASE_URL}/account/profile`,
        options
      );

    res.json(response);
}