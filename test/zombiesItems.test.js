const request = require('supertest');
const { describe, it, before } = require('mocha');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const appCreator = require('../index');

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

describe('Items', async () => {
    let app;
    before('Empty the DB before tesing then add a user', async () => {
        const dbName = path.resolve(__dirname, '..', 'DBManager', 'dbStore.json');
        if (fs.existsSync(dbName)) {
            fs.unlinkSync(dbName);
        }

        app = appCreator();

        await sleep(10); // wait for `connect` call to finish

        await request(app)
            .post('/zombies')
            .send({
                name: 'john',
                items: [
                    { id: 1, name: 'Diamond Sword' },
                    { id: 2, name: 'Trident' },
                    { id: 3, name: 'Wooden Hoe' }
                ]
            })
            .expect('Content-Type', /json/)
            .expect(201);
    });

    it("GETTing on /zombies/:id/items should return zombie's items", async () => {
        const response = await request(app)
            .get('/zombies/1/items')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.deepEqual(response.body, [
            { id: 1, name: 'Diamond Sword' },
            { id: 2, name: 'Trident' },
            { id: 3, name: 'Wooden Hoe' }
        ]);
    });

    it("GETTing on /zombies/:id/items/:index should return a single zombie's item at the provided index", async () => {
        const response = await request(app)
            .get('/zombies/1/items/1')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.deepEqual(response.body, { id: 2, name: 'Trident' });
    });

    it("PUTing on /zombies/:id/items should replace zombie's items", async () => {
        await request(app)
            .put('/zombies/1/items')
            .set('Content-Type', 'application/json')
            .send([
                { id: 8, name: 'Spawn Egg' },
                { id: 9, name: 'Leather Boots' },
                { id: 10, name: 'Horse Saddle' }
            ])
            .expect('Content-Type', /json/)
            .expect(200);

        const response = await request(app)
            .get('/zombies/1/items')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.deepEqual(response.body, [
            { id: 8, name: 'Spawn Egg' },
            { id: 9, name: 'Leather Boots' },
            { id: 10, name: 'Horse Saddle' }
        ]);
    });
    it('PUTing on /zombies/:id/items should return 404 non-existing zombie', async () => {
        const response = await request(app)
            .put('/zombies/12/items')
            .set('Content-Type', 'application/json')
            .send([
                { id: 8, name: 'Spawn Egg' },
                { id: 9, name: 'Leather Boots' },
                { id: 10, name: 'Horse Saddle' }
            ])
            .expect('Content-Type', /json/)
            .expect(404);

        assert.deepEqual(response.body, {
            error: 'ZOMBIE_NOT_FOUND',
            message: 'There is no zombie under the id 12',
            status: 404
        });
    });
    it("PUTing on /zombies/:id/items should not replace zombie's items if data is invalid", async () => {
        const response = await request(app)
            .put('/zombies/1/items')
            .set('Content-Type', 'application/json')
            .send([
                { id: 8, name: 'Spawn Egg' },
                { id: 9, name: 'Leather Boots' },
                { id_invalid: 10, name: 'Horse Saddle' }
            ])
            .expect('Content-Type', /json/)
            .expect(422);

        assert.deepEqual(response.body, {
            error: 'INVALID_ITEM_SCHEME',
            message:
                'Zombie item must match { id: Number, name: String }. Check item at index 2',
            status: 422
        });
    });
    it('PUTing on /zombies/:id/items should return 404 for non-existing zombies', async () => {
        const response = await request(app)
            .put('/zombies/12/items')
            .set('Content-Type', 'application/json')
            .send([
                { id: 8, name: 'Spawn Egg' },
                { id: 9, name: 'Leather Boots' },
                { id_invalid: 10, name: 'Horse Saddle' }
            ])
            .expect('Content-Type', /json/)
            .expect(404);

        assert.deepEqual(response.body, {
            error: 'ZOMBIE_NOT_FOUND',
            message: 'There is no zombie under the id 12',
            status: 404
        });
    });

    it("PATCHing on /zombies/:id/items should add an extra zombie's item, but should stop at 5 items", async () => {
        async function insert(expectedStatus) {
            return await request(app)
                .patch('/zombies/1/items')
                .set('Content-Type', 'application/json')
                .send({ id: 15, name: 'Brown Glow Stick' })
                .expect('Content-Type', /json/)
                .expect(expectedStatus);
        }

        await insert(200);

        const response = await request(app)
            .get('/zombies/1/items')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.deepEqual(response.body, [
            { id: 8, name: 'Spawn Egg' },
            { id: 9, name: 'Leather Boots' },
            { id: 10, name: 'Horse Saddle' },
            { id: 15, name: 'Brown Glow Stick' }
        ]);

        await insert(200);

        const failureResponse = await insert(422);
        assert.deepEqual(failureResponse.body, {
            error: 'TOO_MANY_ITEMS',
            message: 'A zombie can have up to 5 items',
            status: 422
        });
    });
    it('PATCHing on /zombies/:id/items should return 404 for non-existing zombies', async () => {
        const response = await request(app)
            .patch('/zombies/12/items')
            .set('Content-Type', 'application/json')
            .send({ id: 15, name: 'Brown Glow Stick' })
            .expect('Content-Type', /json/)
            .expect(404);

        assert.deepEqual(response.body, {
            error: 'ZOMBIE_NOT_FOUND',
            message: 'There is no zombie under the id 12',
            status: 404
        });
    });
    it('DELETEing on /zombies/:id/items/:index endpoint should delete the corresponding zombie item', async () => {
        await request(app)
            .delete('/zombies/1/items/1')
            .expect('Content-Type', /json/)
            .expect(200);

        const response = await request(app)
            .get('/zombies/1/items')
            .expect('Content-Type', /json/)
            .expect(200);

        assert.deepEqual(response.body, [
            { id: 8, name: 'Spawn Egg' },
            { id: 10, name: 'Horse Saddle' },
            { id: 15, name: 'Brown Glow Stick' },
            { id: 15, name: 'Brown Glow Stick' }
        ]);
    });
    it('DELETEing on /zombies/:id/items/:index endpoint should return 404 for non existing indices', async () => {
        const response = await request(app)
            .delete('/zombies/1/items/12')
            .expect('Content-Type', /json/)
            .expect(404);

        assert.deepEqual(response.body, {
            error: 'ZOMBIE_ITEM_NOT_FOUND',
            message: 'There is no zombie item under the index 12',
            status: 404
        });
    });
});
