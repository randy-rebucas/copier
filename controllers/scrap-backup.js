/**
 * @author Randy Rebucas
 * @version 0.1.0
 * ...
 */

const connection = require("./../db/index");
const request = require("request-promise");

/**
 * This is a default value.
 */
const limit = 1000;

/**
 * List of available modules.
 * This should be pass on url query.
 * Example: ?module='contacts'
 */
const modules = [
    "contacts",
    "orders",
    "products",
    "transactions",
    "tags",
    "subscriptions",
    "campaigns",
    "opportunities"
];

/**
 * Base variables used for infinate loop.
 */
let total = 0;
let currentPage = 1;
let token = null;

exports.index = async (req, res, next) => {

    const { module } = req.query;

    if (!module) {
        res.status(500).send({
            message: `please provide type of module. ex: ?module=contacts`,
        });
    }
    // Make sure provide module on query is supported.
    if (!isSupportedModule(module)) {
        res.status(500).send({
            message: `${module} not supported!`,
        });
    }
    // Set session token.
    token = req.session.accessToken;

    // Get the last log data.
    let lastLog = await getLastLog(module);

    /**
     * If there is no trace log found ser page to default value 1.
     * Otherwise, Use the offset divided by the limit to make page number.
     * Example: 
     * 2000 / 1000 = 2
     */
    let page = lastLog.length === 0 ? currentPage : (Object.values(lastLog)[0].offset) / limit;

    // Load the items.
    loadItems(page, module);

};

/**
 * Check if module is supported.
 * @param {string} module 
 * @returns 
 */
const isSupportedModule = (module) => {
    return modules.includes(module);
}

/**
 * 
 * @param {number} page 
 * @param {string} module 
 */
const loadItems = async (page, module) => {
    try {
        console.log(`preparing to scrap ${module} data from page: ${page}`);

        // Check if there is more data.
        if (hasMoreItems(page, total)) {

            // Call the API to get data.
            const response = await getItems(page, module);


            let items = responseData(module, response);

            // Create data
            await createItems(items, module);

            // Set total
            total = response.count;

            /**
             * This part will log the last data.
             * This is used for reading the last offset to call the API.
             */
            let lastElement = items.pop();

            // Check if there is an item and the lenght should be greater than zero.
            if (lastElement && Object.keys(lastElement).length) {

                // Call the log checking if it's existing or not.
                let isExistOffset = await checkLastLog(page, module);

                // Create the log if this is not exist.
                if (isExistOffset === 0) {
                    await createLog(page, lastElement.id, module);
                }
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        console.log(`done to scrapping ${module} data from page: ${page}`);
    }
};

/**
 * 
 * @param {string} module 
 * @param {Object} response 
 * @returns 
 */
const responseData = (module, response) => {
    let items;
    switch (module) {
        case 'contacts':
            items = response.contacts
            break;
        case 'orders':
            items = response.orders
            break;
        case 'products':
            items = response.products
            break;
        case 'transactions':
            items = response.transactions
            break;
        case 'tags':
            items = response.tags
            break;
        case 'subscriptions':
            items = response.subscriptions
            break;
        case 'campaigns':
            items = response.campaigns
            break;
        case 'opportunities':
            items = response.opportunities
            break;
        default:
            break;
    }
    return items;
}

/**
 * Loop all the items.
 * 
 * @param {Array} items 
 * @param {string} module 
 */
const createItems = async (items, module) => {
    let i = 0;
    while (i < items.length) {
        let elem = items[i];

        // Check if the id is existing or not.
        let isExistOffset = await checkExistId(elem.id, module);

        if (isExistOffset === 0) {

            await doScrapping(module, elem);
        }

        if (i == items.length - 1) {
            currentPage++;

            // Call loadItems method again so it will loop until it reaches the maximum count.
            loadItems(currentPage, module);
        }
        i++;
    }
};

/**
 * 
 * @param {string} module 
 * @param {Object} elem 
 */
const doScrapping = async (module, elem) => {
    switch (module) {
        case 'contacts':
            await createContacts(elem);
            break;
        case 'orders':
            await createOrders(elem);
            break;
        case 'products':
            await createProducts(elem);
            break;
        case 'transactions':
            await createTransactions(elem);
            break;
        case 'tags':
            await createTags(elem);
            break;
        case 'subscriptions':
            await createSubscriptions(elem);
            break;
        case 'campaigns':
            await createCampaigns(elem);
            break;
        case 'campaigns':
            await createOpportunities(elem);
            break;
        default:
            break;
    }
}

/**
 * 
 * @param {number} id 
 * @param {string} module 
 * @returns 
 */
const checkExistId = async (id, module) => {
    return new Promise((resolve, reject) => {
        return connection.query(
            `SELECT EXISTS(SELECT * from ${module} WHERE ${makeSingular(module)}_id=?) AS isExist`,
            [id],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(Object.assign({}, results.shift()).isExist);
            })
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createContacts = (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO contacts(
        email_opted_in,
        last_updated, 
        date_created, 
        owner_id, 
        given_name, 
        middle_name, 
        family_name, 
        email_status, 
        ScoreValue, 
        company,
        email_addresses,
        addresses,
        phone_numbers,
        contact_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.email_opted_in === "true" ? true : false,
                new Date(elem.last_updated),
                new Date(elem.date_created),
                elem.owner_id,
                elem.given_name,
                elem.middle_name,
                elem.family_name,
                elem.email_status,
                elem.ScoreValue,
                JSON.stringify(elem.company),
                JSON.stringify(elem.email_addresses),
                JSON.stringify(elem.addresses),
                JSON.stringify(elem.phone_numbers),
                elem.id,
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createOrders = (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO orders(
        order_id,
        title,
        status,
        total,
        contact,
        note,
        terms,
        source_type,
        creation_date,
        modification_date,
        order_date,
        lead_affiliate_id,
        sales_affiliate_id,
        total_paid,
        total_due,
        refund_total,
        shipping_information,
        allow_payment,
        allow_paypal,
        order_items,
        payment_plan,
        invoice_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.title,
                elem.status,
                elem.total,
                JSON.stringify(elem.contact),
                elem.note,
                elem.terms,
                elem.source_type,
                new Date(elem.creation_date),
                new Date(elem.modification_date),
                new Date(elem.order_date),
                elem.lead_affiliate_id,
                elem.sales_affiliate_id,
                elem.total_paid,
                elem.total_due,
                elem.refund_total,
                JSON.stringify(elem.shipping_information),
                elem.allow_payment,
                elem.allow_paypal,
                JSON.stringify(elem.order_items),
                JSON.stringify(elem.payment_plan),
                elem.invoice_number
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createProducts = async (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO products(
        product_id,
        sku,
        url,
        status,
        product_name,
        product_desc,
        product_price,
        product_short_desc,
        subscription_only,
        product_options,
        subscription_plans
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.sku,
                elem.url,
                elem.status,
                elem.product_name,
                elem.product_desc,
                elem.product_price,
                elem.product_short_desc,
                elem.subscription_only,
                JSON.stringify(elem.product_options),
                JSON.stringify(elem.subscription_plans)
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createTransactions = async (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO transactions(
        transaction_id,
        amount,
        collection_method,
        contact_id,
        currency,
        errors,
        gateway,
        gateway_account_name,
        order_ids,
        orders,
        paymentDate,
        status,
        test,
        transaction_date,
        type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.amount,
                elem.collection_method,
                elem.contact_id,
                elem.currency,
                elem.errors,
                elem.gateway,
                elem.gateway_account_name,
                elem.order_ids,
                JSON.stringify(elem.orders),
                new Date(elem.paymentDate),
                elem.status,
                elem.test,
                new Date(elem.transaction_date),
                elem.type,
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createTags = async (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO tags(
        tag_id,
        name,
        description,
        category
        ) VALUES (?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.name,
                elem.description,
                JSON.stringify(elem.category)
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createSubscriptions = (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO subscriptions(
        subscription_id,
        active,
        allow_tax,
        auto_charge,
        billing_amount,
        billing_cycle,
        billing_frequency,
        contact_id,
        credit_card_id,
        end_date,
        next_bill_date,
        payment_gateway_id,
        product_id,
        quantity,
        sale_affiliate_id,
        start_date,
        subscription_plan_id,
        use_default_payment_gateway
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.active,
                elem.allow_tax,
                elem.auto_charge,
                elem.billing_amount,
                elem.billing_cycle,
                elem.billing_frequency,
                elem.contact_id,
                elem.credit_card_id,
                elem.end_date,
                new Date(elem.next_bill_date),
                elem.payment_gateway_id,
                elem.product_id,
                elem.quantity,
                elem.sale_affiliate_id,
                new Date(elem.start_date),
                elem.subscription_plan_id,
                elem.use_default_payment_gateway
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createCampaigns = (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO campaigns(
            campaign_id,
            created_by_global_id,
            date_created,
            error_message,
            goals,
            locked,
            name,
            published_date,
            published_status,
            published_time_zone,
            sequences,
            time_zone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.created_by_global_id,
                new Date(elem.date_created),
                elem.error_message,
                JSON.stringify(elem.goals),
                elem.locked,
                elem.name,
                new Date(elem.published_date),
                elem.published_status,
                elem.published_time_zone,
                JSON.stringify(elem.sequences),
                elem.time_zone
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {Object} elem 
 * @returns 
 */
const createOpportunities = (elem) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO campaigns(
            opportunity_id,
            affiliate_id,
            contact,
            custom_fields,
            date_created,
            estimated_close_date,
            include_in_forecast,
            last_updated,
            next_action_date,
            next_action_notes,
            opportunity_notes,
            opportunity_title,
            projected_revenue_high,
            projected_revenue_low,
            stage,
            user
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        return connection.query(
            query,
            [
                elem.id,
                elem.affiliate_id,
                JSON.stringify(elem.contact),
                JSON.stringify(elem.custom_fields),
                new Date(elem.date_created),
                new Date(elem.estimated_close_date),
                elem.include_in_forecast,
                new Date(elem.last_updated),
                new Date(elem.next_action_date),
                elem.next_action_notes,
                elem.opportunity_notes,
                elem.opportunity_title,
                elem.projected_revenue_high,
                elem.projected_revenue_low,
                JSON.stringify(elem.stage),
                JSON.stringify(elem.user)
            ],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            }
        );
    });
}

/**
 * 
 * @param {string} module 
 * @returns 
 */
const getLastLog = async (module) => {
    let maxQuery = `SELECT * FROM logs WHERE id=(SELECT MAX(id) FROM logs) AND type='${module}'`;
    return new Promise((resolve, reject) => {
        return connection.query(maxQuery, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve(results)
        });
    });
}

/**
 * 
 * @param {number} page 
 * @param {string} module 
 * @returns 
 */
const checkLastLog = (page, module) => {
    let query = `SELECT EXISTS(SELECT * from logs WHERE offset=? AND type='${module}') AS isExistOffset`;
    return new Promise((resolve, reject) => {
        return connection.query(
            query,
            [(page - 1) * limit],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(Object.assign({}, results.shift()).isExistOffset)
            });
    });
}

/**
 * 
 * @param {number} page 
 * @param {number} lastId 
 * @param {string} module 
 * @returns 
 */
const createLog = (page, lastId, module) => {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO logs(
        offset,
        last_id,
        type
        ) VALUES (?, ?, ?);`;
        return connection.query(
            query,
            [(page - 1) * limit, lastId, module],
            (error, rows) => {
                if (error) {
                    reject(error);
                }
                resolve(rows)
            }
        );
    });
}

/**
 * 
 * @param {number} page 
 * @param {number} total 
 * @returns 
 */
const hasMoreItems = (page, total) => {
    const startIndex = ((page / limit) - 1) * limit + 1;
    return total === 0 || startIndex < total;
};

/**
 * 
 * @param {number} page 
 * @param {string} module 
 * @returns 
 */
const getItems = async (page, module) => {
    const options = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        json: true
    };

    const queryParams = new URLSearchParams({
        limit: limit,
        offset: (page - 1) * limit,
    });

    if (module === 'contacts') {
        queryParams.append("order", "id");
        queryParams.append("order_direction", "ASCENDING");
    }

    return await request.get(
        `${process.env.BASE_URL}/${module}?${queryParams}`,
        options
    );
};

/**
 * 
 * @param {string} word 
 * @returns 
 */
const makeSingular = (word) => {
    const endings = {
        ves: 'fe',
        ies: 'y',
        i: 'us',
        zes: 'ze',
        ses: 's',
        es: 'e',
        s: ''
    };
    return word.replace(
        new RegExp(`(${Object.keys(endings).join('|')})$`),
        r => endings[r]
    );
}