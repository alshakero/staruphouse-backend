const DBManager = require('../db');
const {
    validateZombie,
    validateZombieDeletions,
    validateZombieMutation
} = require('../validators');
const errors = require('./errors');

/**
 * Creates a DB instance, connects to the DB, and returns all routes of `zombies` endpoint
 */
module.exports = function createActions() {
    const DB = new DBManager();
    DB.connect();

    return [
        {
            HTTPVerb: 'get',
            route: '/zombies',
            description: 'Returns an array containing all recorded zombies',
            async callback(req, res) {
                const zombies = await DB.getAllZombies();
                res.send(JSON.stringify(zombies));
            }
        },
        {
            HTTPVerb: 'post',
            route: '/zombies',
            description: `Creates and returns a new zombie object`,
            async callback(req, res) {
                const zombie = req.body;
                const validation = validateZombie(zombie);
                if (!validation.result) {
                    errors.VALIDATION_ERROR(res, validation);
                    return;
                }
                const result = await DB.createZombie(zombie);
                res.status(201); // REST creation success status
                res.send(JSON.stringify(result));
            }
        },
        {
            HTTPVerb: 'get',
            route: '/zombies/:id',
            description: `Retrieves a zombie object with total items value, by zombie's id`,
            async callback(req, res) {
                const id = req.params.id;
                const result = await DB.getZombieWithTotalValue(id);

                if (!result) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }
                res.send(JSON.stringify(result));
            }
        },
        {
            HTTPVerb: 'put',
            route: '/zombies/:id',
            description: `Updates a zombie by its id, accepts a JSON body representing the mutation object. It merges your mutation object with the object in the DB. Returns the updated object`,
            async callback(req, res) {
                const id = req.params.id;

                const zombie = await DB.getZombie(id);

                if (!zombie) {
                    errors.ZOMBIE_NOT_FOUND(res, id);
                    return;
                }

                const mutations = req.body;
                const validation = validateZombieMutation(mutations, id);

                if (!validation.result) {
                    errors.VALIDATION_ERROR(res, validation);
                    return;
                }

                const updatedZombie = await DB.updateZombie(id, mutations);
                res.send(JSON.stringify(updatedZombie));
            }
        },
        {
            HTTPVerb: 'delete',
            route: '/zombies/:id',
            description:
                'Deletes a zombie by its id and returns `{result: success}`',
            async callback(req, res) {
                const id = req.params.id;
                const deletedZombies = await DB.deleteZombie(id);
                const validation = validateZombieDeletions(deletedZombies);
                if (!validation.result) {
                    errors.VALIDATION_ERROR(res, validation, 404);
                    return;
                }
                res.send(JSON.stringify({ result: 'success' }));
            }
        }
    ];
};
