const request = require('supertest');
const { describe, it, before } = require('mocha');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const appCreator = require('../index');

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

const DBBackupName = 'dbStore_backup.json';

describe('Zombies', async () => {
    let app;
    before('Empty the DB before tesing', async () => {
        const dbName = path.resolve(__dirname, '..', 'db', 'dbStore.json');
        if (fs.existsSync(dbName)) {
            fs.unlinkSync(dbName);
        }

        app = appCreator();

        await sleep(10); // wait for `connect` call to finish
    });

    it('GETing on /zombies/:id should return a zombie with its items', async () => {
        const response = await request(app)
            .get('/zombies')
            .expect('Content-Type', /json/)
            .expect('Content-Length', '2')
            .expect(200);

        assert.deepEqual(response.body, []);
    });
    it('POSTing on /zombies endpoint should insert a zombie and return 201', async () => {
        await request(app)
            .post('/zombies')
            .send({ name: 'john' })
            .expect('Content-Type', /json/)
            .expect(201);

        await sleep(10);

        const response = await request(app)
            .get('/zombies')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.equal(response.body.length, 1);
        assert.equal(response.body[0].name, 'john');
        assert.deepEqual(response.body[0].items, []);
    });
    it('POSTing on /zombies endpoint should not insert an invalid zombie', async () => {
        const response = await request(app)
            .post('/zombies')
            .send({ name: { name: 'some name' } })
            .expect('Content-Type', /json/)
            .expect(422);

        assert.deepEqual(response.body, {
            error: 'INVALID_ZOMBIE_NAME',
            message: 'Zombie name must be a string',
            status: 422
        });
    });
    it('POSTing on /zombies endpoint should not insert an invalid zombie (too many items)', async () => {
        const response = await request(app)
            .post('/zombies')
            .send({
                name: 'John',
                items: [
                    { id: 9, name: 'Leather Boots' },
                    { id: 10, name: 'Horse Saddle' },
                    { id: 11, name: 'Tonic' },
                    { id: 12, name: 'Knowledge Book' },
                    { id: 13, name: 'Flower Pot' },
                    { id: 14, name: 'Enchanted Book' },
                    { id: 15, name: 'Brown Glow Stick' }
                ]
            })
            .expect('Content-Type', /json/)
            .expect(422);

        assert.deepEqual(response.body, {
            error: 'TOO_MANY_ITEMS',
            message: 'A zombie can have up to 5 items',
            status: 422
        });
    });
    it('GETing on /zombies/:id endpoint should return the corresponding zombie', async () => {
        const response = await request(app)
            .get('/zombies/0') // we know it's `0` because we just inserted it as the first element
            .expect('Content-Type', /json/)
            .expect(200);

        await sleep(10);

        assert.equal(response.body.id, 0);
        assert.equal(response.body.name, 'john');
        assert.deepEqual(response.body.items, []);
    });
    it('GETing on /zombies/:id endpoint should return 404 for non-existing ids', async () => {
        await request(app)
            .get('/zombies/10')
            .expect('Content-Type', /json/)
            .expect(404);
    });
    it('PUTing on /zombies/:id endpoint should update the corresponding zombie', async () => {
        await request(app)
            .put('/zombies/0') // we know it's `0` because we just inserted it as the first element
            .set('Content-Type', 'application/json')
            .send({ name: 'new john' })
            .expect('Content-Type', /json/)
            .expect(200);

        const response = await request(app)
            .get('/zombies/0') // we know it's `0` because we just inserted it as the first element
            .expect('Content-Type', /json/)
            .expect(200);

        await sleep(10);

        assert.equal(response.body.id, 0);
        assert.equal(response.body.name, 'new john');
    });

    it('PUTing on /zombies/:id endpoint should not update the zombie if name is invalid', async () => {
        const response = await request(app)
            .put('/zombies/0') // we know it's `0` because we just inserted it as the first element
            .set('Content-Type', 'application/json')
            .send({ name: '' })
            .expect('Content-Type', /json/)
            .expect(422);

        assert.deepEqual(response.body, {
            error: 'INVALID_ZOMBIE_NAME',
            message: 'Zombie must have a name',
            status: 422
        });
    });
    it('PUTing on /zombies/:id endpoint should not update the zombie if items are invalid', async () => {
        const response = await request(app)
            .put('/zombies/0') // we know it's `0` because we just inserted it as the first element
            .set('Content-Type', 'application/json')
            .send({ items: [{ id: 9, name: 'Leather Boots' }, 1] })
            .expect('Content-Type', /json/)
            .expect(422);

        assert.deepEqual(response.body, {
            error: 'INVALID_ZOMBIE_ITEM',
            message: 'A zombie item must be an object. Check item at index 1',
            status: 422
        });
    });

    it('PUTing on /zombies/:id endpoint should return 404 for non-existing ids', async () => {
        await request(app)
            .put('/zombies/10') // we know it's `0` because we just inserted it as the first element
            .set('Content-Type', 'application/json')
            .send({ name: 'new john' })
            .expect(404);
    });
    it('DELETing on /zombies/:id endpoint should delete the corresponding zombie', async () => {
        await request(app)
            .delete('/zombies/0')
            .expect('Content-Type', /json/)
            .expect(200);

        await request(app)
            .get('/zombies/0')
            .expect('Content-Type', /json/)
            .expect(404);
    });
    it('DELETing on /zombies/:id endpoint should return 404 for non-existing ids', async () => {
        await request(app)
            .delete('/zombies/10')
            .expect('Content-Type', /json/)
            .expect(404);
    });
});
