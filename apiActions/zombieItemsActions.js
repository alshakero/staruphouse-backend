const DBManager = require('../db');
const { validateZombieItems, validateZombieItem } = require('../validators');
const errors = require('./errors');

/**
 * Creates a DB instance, connects to the DB, and returns all routes of `zombie/items` endpoint
 */
module.exports = function createActions() {
    const DB = new DBManager();
    DB.connect();

    return [
        {
            HTTPVerb: 'get',
            route: '/zombies/:id/items',
            description: `Returns an array represting all zombie's items`,
            async callback(req, res) {
                const id = req.params.id;
                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                res.send(JSON.stringify(zombie.items));
            }
        },
        {
            HTTPVerb: 'put',
            route: '/zombies/:id/items',
            description: `Accepts a PUT request to replace the whole items array of in given zombie. Returns the updated zombie`,
            async callback(req, res) {
                const id = req.params.id;
                const items = req.body;

                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                const validation = validateZombieItems(items);

                if (!validation.result) {
                    errors.VALIDATION_ERROR(res, validation);
                    return;
                }

                const updatedZombie = await DB.updateZombie(id, { items });
                res.send(JSON.stringify(updatedZombie));
            }
        },
        {
            HTTPVerb: 'patch',
            route: '/zombies/:id/items',
            description: `Accepts a PATCH request to insert a single new item in given zombie's items. Returns the updated zombie`,
            async callback(req, res) {
                const id = req.params.id;
                const item = req.body;

                const itemValidation = validateZombieItem(item);

                if (!itemValidation.result) {
                    errors.VALIDATION_ERROR(res, itemValidation);
                    return;
                }

                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                const newItems = [...zombie.items, item];

                const allItemsValidation = validateZombieItems(newItems);

                if (!allItemsValidation.result) {
                    errors.VALIDATION_ERROR(res, allItemsValidation);
                    return;
                }

                const updatedZombie = await DB.updateZombie(id, {
                    items: newItems
                });

                res.send(JSON.stringify(updatedZombie));
            }
        },
        {
            HTTPVerb: 'get',
            route: '/zombies/:id/items/:item_index',
            description: `Returns a single zombie's item selected at the given index. Note that item's index should not be confused with item's id.`,
            async callback(req, res) {
                const id = req.params.id;
                const item_index = req.params.item_index;
                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                const item = zombie.items[item_index];

                if (!item) {
                    errors.ZOMBIE_ITEM_NOT_FOUND(res, item_index);
                    return;
                }

                res.send(JSON.stringify(item));
            }
        },
        {
            HTTPVerb: 'delete',
            route: '/zombies/:id/items/:item_index',
            description: `Deletes a zombie's item at the provided index`,
            async callback(req, res) {
                const id = req.params.id;
                const item_index = req.params.item_index;

                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                const item = zombie.items[item_index];

                if (!item) {
                    errors.ZOMBIE_ITEM_NOT_FOUND(res, item_index);
                    return;
                }

                zombie.items.splice(item_index, 1);

                const newZombie = await DB.updateZombie(id, {
                    ...zombie,
                    items: zombie.items
                });

                res.send(JSON.stringify(newZombie));
            }
        }
    ];
};
