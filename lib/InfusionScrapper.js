
const connection = require("../db/index");
const request = require("request-promise");

class InfusionScrapper {

    /**
     * 
     * @param {string} token 
     * @param {string} module 
     * @param {int} limit 
     */
    constructor(token, module, limit = 100) {
        this.token = token;
        this.module = module;
        this.limit = limit;
        this.modules = ['contacts', 'orders', 'products', 'transactions', 'tags', 'subscriptions', 'campaigns', 'opportunities'];

        this._total = 0;
        this._page = 1;
        this._items = [];
    }

    set total(total) {
        this._total = total;
    }

    get total() {
        return this._total;
    }

    set page(page) {
        this._page = page;
    }

    get page() {
        return this._page;
    }

    set items(items) {
        this._items = items;
    }

    get items() {
        return this._items;
    }

    /**
     * 
     * @param {function} callback 
     */
    async init(callback) {

        // Get the last log data.
        let lastLog = await this.getLog();

        // /**
        //  * If there is no trace log found ser page to default value 1.
        //  * Otherwise, Use the offset divided by the limit to make page number.
        //  * Example: 
        //  * 2000 / 1000 = 2
        //  */
        this.page = lastLog.length === 0 ? this.page : (Object.values(lastLog)[0].offset / this.limit);

        // call loadItems
        this.loadItems((r) => {
            callback(r)
        });
    }

    /**
     * 
     * @param {int} page 
     * @param {function} callback 
     */
    async loadItems(callback) {

        if (this.hasMoreItems()) {
            console.log(`preparing to scrap ${this.module} data from page: ${this.page}`);
            // call the API to get quotes
            const response = await this.requesItems();

            this.items = response.data;

            this.createItems((newPage) => {
                console.log(`done scrapping ${this.module} on page: ${this.page}`);
                this.page = newPage;

                if (this.hasMoreItems()) {
                    this.loadItems(callback);
                }
            });

            this.storeLog();

            this.total = response.count;

            callback({
                done: false,
                message: 'more data to scrapp.'
            });
        } else {
            callback({
                done: true,
                message: 'scrapping done.'
            });
        }

    };

    /**
     * 
     * @param {number} page 
     */
    async storeLog() {
        /**
         * This part will log the last data.
         * This is used for reading the last offset to call the API.
         */
        let item = this.items.pop();

        // Check if there is an item and the lenght should be greater than zero.
        if (item && Object.keys(item).length) {

            // Call the log checking if it's existing or not.
            let isExistOffset = await this.checkLastLog();

            // Create the log if this is not exist.
            if (isExistOffset === 0) {
                await this.createLog(item.id);
            }
        }
    }

    /**
     * 
     * @param {Object} response 
     * @returns 
     */
    responseData(response) {
        const storeMethods = {
            contacts: response.contacts,
            orders: response.orders,
            products: response.products,
            transactions: response.transactions,
            tags: response.tags,
            subscriptions: response.subscriptions,
            campaigns: response.campaigns,
            opportunities: response.opportunities,
        };
        return storeMethods[this.module];
    }

    /**
     * 
     * @param {number} page 
     * @returns boolean
     */
    hasMoreItems() {
        const startIndex = (this.page - 1) * this.limit + 1;
        return this.total === 0 || startIndex < this.total;
    };

    /**
     * 
     * @param {function} callback 
     */
    async createItems(callback) {
        let i = 0;
        while (i < this.items.length) {
            let elem = this.items[i];

            // Check if the id is existing or not.
            let isExistOffset = await this.checkExistId(elem.id);

            if (isExistOffset === 0) {

                await this.doScrapping(elem);
            }
            // 50 == 51 - 1
            if (i == this.items.length - 1) {
                callback(this.page += 1);
            }
            i++;
        }
    }

    /**
     * 
     * @param {int} page 
     * @returns Object
     */
    async requesItems() {
        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            json: true
        };

        const queryParams = new URLSearchParams({
            limit: this.limit,
            offset: (this.page - 1) * this.limit,
        });

        if (this.module === 'contacts') {
            queryParams.append("order", "id");
            queryParams.append("order_direction", "ASCENDING");
        }

        let response = await request.get(`${process.env.BASE_URL}/${this.module}?${queryParams}`, options);

        const responseTypes = {
            contacts: response.contacts,
            orders: response.orders,
            products: response.products,
            transactions: response.transactions,
            tags: response.tags,
            subscriptions: response.subscriptions,
            campaigns: response.campaigns,
            opportunities: response.opportunities,
        };

        return {
            data: responseTypes[this.module],
            count: response.count
        }
    };

    /**
     * 
     * @param {Object} elem 
     */
    async doScrapping(elem) {
        const storeMethods = {
            contacts: this.storeContacts.bind(this),
            orders: this.storeOrders.bind(this),
            products: this.storeProducts.bind(this),
            transactions: this.storeTransactions.bind(this),
            tags: this.storeTags.bind(this),
            subscriptions: this.storeSubscriptions.bind(this),
            campaigns: this.storeCampaigns.bind(this),
            opportunities: this.storeOpportunities.bind(this),
        };
        await storeMethods[this.module](elem);
    }

    /**
     * 
     * @param {Object} elem 
     * @returns 
     */
    async storeContacts(elem) {
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
            )  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;
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
    async storeOrders(elem) {
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
    async storeProducts(elem) {
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
    async storeTransactions(elem) {
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
    async storeTags(elem) {
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
    async storeSubscriptions(elem) {
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
    async storeCampaigns(elem) {
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
    async storeOpportunities(elem) {
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
     * @param {int} id 
     * @returns int 1/0
     */
    async checkExistId(id) {
        return new Promise((resolve, reject) => {
            return connection.query(
                `SELECT EXISTS(SELECT * from ${this.module} WHERE ${this.makeSingular(this.module)}_id=?) AS isExist`,
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
     * @returns Object
     */
    async getLog() {
        return new Promise((resolve, reject) => {
            let maxQuery = `SELECT * FROM logs WHERE type='${this.module}' ORDER BY id DESC LIMIT 1;`;
            // let maxQuery = `SELECT * FROM logs WHERE id=(SELECT MAX(id) FROM logs) AND type='${this.module}'`;
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
     * @param {int} page 
     * @param {int} lastId 
     * @returns rows
     */
    async createLog(lastId) {
        return new Promise((resolve, reject) => {
            let query = `INSERT INTO logs(
            offset,
            last_id,
            type
            ) VALUES (?, ?, ?);`;
            return connection.query(
                query,
                [(this.page - 1) * this.limit, lastId, this.module],
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
     * @param {int} page 
     * @returns int 1/0
     */
    async checkLastLog() {
        return new Promise((resolve, reject) => {
            let query = `SELECT EXISTS(SELECT * from logs WHERE offset=? AND type='${this.module}') AS isExistOffset`;
            return connection.query(
                query,
                [(this.page - 1) * this.limit],
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
     * @param {string} word 
     * @returns 
     */
    makeSingular(word) {
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

    /**
     * 
     * @returns boolean
     */
    isSupportedModule() {
        return this.modules.includes(this.module);
    }

}

module.exports = InfusionScrapper;