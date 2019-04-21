const lowDB = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('dbStore.json');
const { validateZombie } = require('../validators');

class DBManager {
    /**
     * Connect to the DB. Needs to be called before using other methods
     */
    async connect() {
        const instance = await lowDB(adapter);
        this._instance = instance;

        // Set the defaults
        await instance.defaults({ zombies: [], zombie_id_serial: 0 }).write();
    }
    /**
     * Checks if this instance is connected to the DB. Throws an error if not.
     */
    _ensureConnected() {
        if(!this._instance) {
            throw new TypeError('You need to call `connect` method before calling any other methods');
        }
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
        const zombie = { id, ...zombieObj };

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
     * Mutates and returns a zombie
     * @param {Number} id the zombie id 
     * @param {*} newZombieData you partial object of the new zombie. This works like `Object.assign`. However, you need to pass at least one prop of zombie object
     */
    async updateZombie(id, newZombieData) {
        this._ensureConnected();

        return await this._instance
            .get('zombies')
            .filter(zombie => zombie.id == id)
            .nth(0)
            .assign(newZombieData)
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
