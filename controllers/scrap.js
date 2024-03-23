/**
 * @author Randy Rebucas
 * @version 1.1.0
 * ...
 */
const InfusionScrapper = require('./../lib/InfusionScrapper');

const limit = 1000;

exports.index = async (req, res, next) => {

    const { module } = req.query;

    const infusionScrapper = new InfusionScrapper(req.connection, req.session.accessToken, module, limit);

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
        try {

            /**
             * call initialize method
             */
            infusionScrapper.init((output) => {
                if (output.done) {
                    res.json(output);
                }
            });
        } catch (error) {
            res.status(400).json(error);
        }
    }
};