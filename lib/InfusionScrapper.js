
const connection = require("../db/index");
const request = require("request-promise");

class InfusionScrapper {

    constructor() {
        this._modules = [];
        this._module = null;
        this._limit = 1000;
        this._total = 0;
        this._page = 1;
        this._token = null;
        this._items = [];
    }

    set modules(modules) {
        this._modules = modules;
    }

    get modules() {
        return this._modules;
    }

    set module(module) {
        this._module = module;
    }

    get module() {
        return this._module;
    }

    set limit(limit) {
        this._limit = limit;
    }

    get limit() {
        return this._limit;
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

    set token(token) {
        this._token = token;
    }

    get token() {
        return this._token;
    }

    set items(items) {
        this._items = items;
    }

    get items() {
        return this._items;
    }

    async init() {

        // Get the last log data.
        let lastLog = await this.getLog();
        // /**
        //  * If there is no trace log found ser page to default value 1.
        //  * Otherwise, Use the offset divided by the limit to make page number.
        //  * Example: 
        //  * 2000 / 1000 = 2
        //  */
        let page = lastLog.length === 0 ? this.page : (Object.values(lastLog)[0].offset / this.limit);

        this.loadItems(page);
    }

    async loadItems(page) {
        try {
            // if having more quotes to fetch
            if (this.hasMoreItems(page)) {
                console.log(`preparing to scrap ${this.module} data from page: ${page}`);
                // call the API to get quotes
                const response = await this.requesItems(page);

                this.items = response.contacts;

                await this.createItems();

                this.total = response.count;

                /**
             * This part will log the last data.
             * This is used for reading the last offset to call the API.
             */
                let item = this.items.pop();

                // Check if there is an item and the lenght should be greater than zero.
                if (item && Object.keys(item).length) {

                    // Call the log checking if it's existing or not.
                    let isExistOffset = await this.checkLastLog(page);

                    // Create the log if this is not exist.
                    if (isExistOffset === 0) {
                        await this.createLog(page, item.id);
                    }
                }
            }

            return true;
        } catch (error) {
            return error;
        } finally {
            console.log(`done to scrapping ${this.module} data from page: ${this.page}`);
        }
    };

    hasMoreItems(page) {
        const startIndex = ((page / this.limit) - 1) * this.limit + 1;
        return this.total === 0 || startIndex < this.total;
    };

    async createItems() {

        let i = 0;
        while (i < this.items.length) {
            let elem = this.items[i];

            // Check if the id is existing or not.
            let isExistOffset = await this.checkExistId(elem.id);

            if (isExistOffset === 0) {

                await this.storeItems(elem);
            }

            if (i == this.items.length - 1) {
                this.page++;

                this.loadItems(this.page);
            }
            i++;
        }
    }

    async storeItems(elem) {
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

    async checkExistId(id) {
        return new Promise((resolve, reject) => {
            return connection.query(
                `SELECT EXISTS(SELECT * from ${this._module} WHERE ${this.makeSingular(this._module)}_id=?) AS isExist`,
                [id],
                (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(Object.assign({}, results.shift()).isExist);
                })
        });
    }

    async getLog() {
        return new Promise((resolve, reject) => {
            let maxQuery = `SELECT * FROM logs WHERE id=(SELECT MAX(id) FROM logs) AND type='${this._module}'`;
            return connection.query(maxQuery, (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results)
            });
        });
    }

    async createLog(page, lastId) {
        return new Promise((resolve, reject) => {
            let query = `INSERT INTO logs(
            offset,
            last_id,
            type
            ) VALUES (?, ?, ?);`;
            return connection.query(
                query,
                [(page - 1) * this.limit, lastId, this.module],
                (error, rows) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(rows)
                }
            );
        });
    }

    async checkLastLog(page) {
        return new Promise((resolve, reject) => {
            let query = `SELECT EXISTS(SELECT * from logs WHERE offset=? AND type='${this.module}') AS isExistOffset`;
            return connection.query(
                query,
                [(page - 1) * this.limit],
                (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(Object.assign({}, results.shift()).isExistOffset)
                });
        });
    }

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

    isSupportedModule() {
        return this.modules.includes(this._module);
    }

    async requesItems(page) {
        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            json: true
        };

        const queryParams = new URLSearchParams({
            limit: this.limit,
            offset: (page - 1) * this.limit,
        });

        if (this.module === 'contacts') {
            queryParams.append("order", "id");
            queryParams.append("order_direction", "ASCENDING");
        }

        return await request.get(
            `${process.env.BASE_URL}/${this.module}?${queryParams}`,
            options
        );
    };
}

module.exports = InfusionScrapper;