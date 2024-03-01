var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./scratch");

module.exports = (req, res, next) => {
    const queryParams = new URLSearchParams({
        response_type: "code",
        scope: "full",
        client_id: req.infusionsoft.client_id ?? process.env.INFUSIONSOFT_CLIENT_ID,
        redirect_uri:
            req.infusionsoft.redirect_url ?? process.env.INFUSIONSOFT_REDIRECT_URL,
    });

    req.getAuthorizationUrl = `${process.env.OAUTH2_AUTHORIZATION_URL}?${queryParams}`;

    next();
};