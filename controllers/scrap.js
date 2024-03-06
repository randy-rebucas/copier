/**
 * @author Randy Rebucas
 * @version 0.1.0
 * ...
 */
const InfusionScrapper = require('./../lib/InfusionScrapper');
const infusionScrapper = new InfusionScrapper();

infusionScrapper.modules = [
    "contacts",
    "orders",
    "products",
    "transactions",
    "tags",
    "subscriptions",
    "campaigns",
    "opportunities"
];

exports.index = async (req, res, next) => {

    const { module } = req.query;

    infusionScrapper.module = module;       // contacts

    // Set session token.
    infusionScrapper.token = req.session.accessToken;

    if (!infusionScrapper.module) {
        res.status(400).json({
            error: `please provide type of module. ex: ?module=contacts`,
        });
        // Make sure provide module on query is supported.
    } else if (!infusionScrapper.isSupportedModule()) {
        res.status(400).json({
            error: `${infusionScrapper.module} not supported!`,
        });
    } else {
        let output = await infusionScrapper.init();
        console.log(output);
        if (output) {
            res.json({
                message: 'scrapping data done!'
            })
        }
    }
};