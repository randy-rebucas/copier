/**
 * @author Randy Rebucas
 * @version 0.1.0
 * ...
 */
const InfusionScrapper = require('./../lib/InfusionScrapper');
const infusionScrapper = new InfusionScrapper();

exports.index = async (req, res, next) => {

    const { module } = req.query;

    infusionScrapper.module = module;
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
        // Set session token.
        infusionScrapper.token = req.session.accessToken;

        // Get the last log data.
        let lastLog = await infusionScrapper.getLog();

        // /**
        //  * If there is no trace log found ser page to default value 1.
        //  * Otherwise, Use the offset divided by the limit to make page number.
        //  * Example: 
        //  * 2000 / 1000 = 2
        //  */
        let page = lastLog.length === 0 ? infusionScrapper.page : (Object.values(lastLog)[0].offset / infusionScrapper.limit);

        loadItems(page);
    }
};

/**
 * 
 * @param {number} page 
 * @param {string} module 
 */
const loadItems = async (page) => {
    try {
        infusionScrapper.page = page;
        console.log(`preparing to scrap ${infusionScrapper.module} data from page: ${infusionScrapper.page}`);

        // Check if there is more data.
        if (infusionScrapper.hasMoreItems()) {

            const response = await infusionScrapper.requestData();

            infusionScrapper.items = response.contacts;

            await doScrap();

            infusionScrapper.total = response.count;

            /**
             * This part will log the last data.
             * This is used for reading the last offset to call the API.
             */
            let lastElement = infusionScrapper.items.pop();

            // Check if there is an item and the lenght should be greater than zero.
            if (lastElement && Object.keys(lastElement).length) {

                // Call the log checking if it's existing or not.
                let isExistOffset = await infusionScrapper.checkLastLog();

                // Create the log if this is not exist.
                if (isExistOffset === 0) {
                    await infusionScrapper.createLog(lastElement.id);
                }
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        console.log(`done to scrapping ${infusionScrapper.module} data from page: ${infusionScrapper.page}`);
    }
};

const doScrap = async () => {
    let output = await infusionScrapper.startProcess();
    loadItems(output);
}