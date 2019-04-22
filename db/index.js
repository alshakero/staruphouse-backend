const lowDB = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const dbDefaultData = require('./dbDefaultData');
const fetch = require('node-fetch').default;

const H24_IN_MILLSECONDS = 8.64e7;
const ONE_HOUR_IN_MILLSECONDS = 3.6e6;
const CURRENCIES_OF_INTEREST = ['EUR', 'USD'];

function nicerFloats(float) {
    return Number.parseFloat(float.toFixed(4));
}

class DBManager {
    constructor() {
        const path = `./db/dbStore.json`;
        this._adapter = new FileAsync(path);
    }
    /**
     * Connect to the DB. Needs to be called before using other methods
     */
    async connect() {
        const instance = await lowDB(this._adapter);
        this._instance = instance;

        // Set the defaults
        await instance.defaults(dbDefaultData).write();
    }
    /**
     * Checks if this instance is connected to the DB. Throws an error if not.
     */
    _ensureConnected() {
        if (!this._instance) {
            throw new TypeError(
                'You need to call `connect` method before calling any other methods'
            );
        }
    }
    /**
     * Checks if items prices data are fresh. Refreshes them if needed
     */
    async _ensureFreshData() {
        let itemsData = await this._instance.get('zombieItems').value();
        let exchangeData = await this._instance.get('exchangeData').value();
        /* since the data are updated every 24h hours, and itemsData.timestamp is part of the data,
         * checking if `itemsData.timestamp` is older than 24h should be enough to determine if the cache
         * is fresh.
         */
        if (Date.now() - itemsData.timestamp > H24_IN_MILLSECONDS) {
            try {
                const response = await fetch(
                    'https://zombie-items-api.herokuapp.com/api/items'
                );
                itemsData = await response.json();
                await this._instance.set('zombieItems', itemsData).write();
            } catch (error) {
                console.warn(
                    `Failed to update the prices data. Will fail over to the data from ${
                        itemsData.timestamp
                    } timestamp`
                );
            }
        }

        /* 
           we check for exchage rate every hour. Exchange rates a quite complicated problem
           as market prices do not change during bank holidays, weekends and after work hours.
           I think updating once every hour (worst case) is fair enough 
        */
        if (Date.now() - exchangeData.timestamp > ONE_HOUR_IN_MILLSECONDS) {
            try {
                const response = await fetch(
                    'https://api.nbp.pl/api/exchangerates/tables/C/?format=json'
                );
                const rawData = await response.json();
                const rates = rawData[0].rates.filter(currency =>
                    CURRENCIES_OF_INTEREST.includes(currency.code)
                );
                const timestamp = Date.now();

                exchangeData = { ...exchangeData, rates, timestamp };
                await this._instance.set('exchangeData', exchangeData).write();
            } catch (error) {
                console.warn(
                    `Failed to update the exchangeData data. Will fail over to the data from ${
                        exchangeData.timestamp
                    } timestamp`
                );
            }
        }

        return { itemsData, exchangeData };
    }
    /**
     * Returns a Promise<Array> containing all zombies
     */
    getAllZombies() {
        this._ensureConnected();
        return this._instance.get('zombies').value();
    }
    /**
     * Returns a Promise<Number> containing a fresh serial id
     */
    async _getIdAndIncrement() {
        const instance = this._instance;
        const id = await instance.get('zombie_id_serial').value();

        // increment
        await instance.update('zombie_id_serial', n => n + 1).write();

        return id;
    }
    /**
     * Inserts and returns a new zombie
     * @param {Object} zombieObj
     */
    async createZombie(zombieObj) {
        this._ensureConnected();

        const id = await this._getIdAndIncrement();
        const creationDate = Math.floor(Date.now() / 1000); // UNIX timestamp

        // pick `zombieObj` props [name, items] manually for better security
        const zombie = {
            id,
            creationDate,
            name: zombieObj.name,
            items: zombieObj.items || []
        };

        await this._instance
            .get('zombies')
            .push(zombie)
            .write();

        return zombie;
    }
    /**
     * Retrieves a zombie from the DB using its ID
     * @param {Number} id
     * @return {Object} zombie
     */
    async getZombie(id) {
        this._ensureConnected();

        return this._instance
            .get('zombies')
            .filter(zombie => zombie.id == id)
            .nth(0)
            .value();
    }
    /**
     * Retrieves a zombie with total value if its items from the DB using its ID
     * @param {Number} id
     * @return {Object} zombie
     */
    async getZombieWithTotalValue(id) {
        this._ensureConnected();
        const { itemsData, exchangeData } = await this._ensureFreshData();

        const zombie = await this.getZombie(id);

        if (!zombie) {
            return zombie;
        }

        const prices = zombie.items.map(
            item =>
                itemsData.items.find(cachedItem => cachedItem.id === item.id)
                    .price
        );

        const PLN = nicerFloats(prices.reduce((sum, price) => sum + price, 0));
        const EUR = nicerFloats(
            PLN / exchangeData.rates.find(c => c.code === 'EUR').bid
        );
        const USD = nicerFloats(
            PLN / exchangeData.rates.find(c => c.code === 'USD').bid
        );

        const totalValue = { PLN, EUR, USD };

        return { ...zombie, totalValue };
    }
    /**
     * Mutates and returns a zombie
     * @param {Number} id the zombie id
     * @param {*} newZombieData you partial object of the new zombie. This works like `Object.assign`. However, you need to pass at least one prop of zombie object
     */
    async updateZombie(id, newZombieData) {
        this._ensureConnected();

        /* project provided object for better security */
        const zombie = {};
        if (newZombieData.name) {
            zombie.name = newZombieData.name;
        }
        if (newZombieData.items) {
            zombie.items = newZombieData.items;
        }

        return await this._instance
            .get('zombies')
            .filter(zombie => zombie.id == id)
            .nth(0)
            .assign(zombie)
            .write();
    }
    /**
     * Deletes a zombie
     * @param {Number} id
     */
    async deleteZombie(id) {
        this._ensureConnected();

        return await this._instance
            .get('zombies')
            .remove(zombie => zombie.id == id)
            .write();
    }
}

module.exports = DBManager;
