
const connection = require("../db/index");
const request = require("request-promise");

/**
 * List of available modules.
 * This should be pass on url query.
 * Example: ?module='contacts'
 */
// const modules = [
//     "contacts",
//     "orders",
//     "products",
//     "transactions",
//     "tags",
//     "subscriptions",
//     "campaigns",
//     "opportunities"
// ];

class InfusionScrapper {

    constructor() {
        this._module = null;
        this._limit = 1000;
        this._total = 0;
        this._page = 1;
        this._token = null;
        this._items = [];
        this._modules = [];
    }

    get limit() {
        return this._limit;
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

    set token(token) {
        this._token = token;
    }

    get token() {
        return this._token;
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

    incrementPage() {
        this.page++;
    }

    async startProcess() {

        let i = 0;
        while (i < this.items.length) {
            let elem = this.items[i];

            // Check if the id is existing or not.
            let isExistOffset = await this.checkExistId(elem.id);

            if (isExistOffset === 0) {

                await this.createContacts(elem);
            }

            if (i == this.items.length - 1) {
                return this.incrementPage();
            }
            i++;
        }
    }

    async createContacts(elem) {
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

    hasMoreItems() {
        const startIndex = ((this.page / this.limit) - 1) * this.limit + 1;
        return this.total === 0 || startIndex < this.total;
    };

    async requestData() {
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

        return await request.get(
            `${process.env.BASE_URL}/${this.module}?${queryParams}`,
            options
        );
    };
}

module.exports = InfusionScrapper;