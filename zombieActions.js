const DBManager = require('./db');
const { validateZombie, validateZombieDeletions, validateZombieMutation } = require('./validators');
const errors = require('./errors');

const DB = new DBManager();
DB.connect();

module.exports = [
    {
        HTTPVerb: 'get',
        route: '/zombie/:id',
        async callback(req, res) {
            const id = req.params.id;
            const result = await DB.getZombie(id);
            if (!result) {
                errors.ZOMBIE_NOT_FOUND(res, id);
                return;
            }
            res.send(JSON.stringify(result));
        }
    },
    {
        HTTPVerb: 'get',
        route: '/zombies',
        async callback(req, res) {
            const zombies = await DB.getAllZombies();
            res.send(JSON.stringify(zombies));
        }
    },
    {
        HTTPVerb: 'post',
        route: '/zombie',
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
        HTTPVerb: 'put',
        route: '/zombie/:id',
        async callback(req, res) {
            const id = req.params.id;
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
        route: '/zombie/:id',
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
