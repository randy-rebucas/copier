module.exports = function (req, res, next) {
    if (!req.session.accessToken) {
        // res.status(401).send('Invalid access token');
        res.redirect("/");
        return;
    }
    // User is authenticated, proceed to the next middleware or route handler
    next();
};
