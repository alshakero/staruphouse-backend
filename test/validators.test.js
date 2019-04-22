const validators = require('../apiActions/validators');
const assert = require('assert');

const specs = [
    {
        theFunction: validators.validateZombieName,
        specs: [
            {
                name: 'validateZombieName should not accept empty names',
                args: [''],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_NAME',
                    message: 'Zombie must have a name'
                }
            },
            {
                name: 'validateZombieName should only accept strings',
                args: [{ name: 'name' }],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_NAME',
                    message: 'Zombie name must be a string'
                }
            },
            {
                name:
                    'validateZombieName should not accept names longer than 32 charceters',
                args: ['nameeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_NAME',
                    message: 'Zombie name must be 1-32 charactors in length'
                }
            },
            {
                name:
                    'validateZombieName should accept names with 32 characters',
                args: ['nameeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
                expectation: {
                    result: true
                }
            }
        ]
    },
    {
        theFunction: validators.validateZombieItem,
        specs: [
            {
                name: 'should only accept objects',
                args: ['[]'],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_ITEM',
                    message: `A zombie item must be an object. Check item at index 0`
                }
            },
            {
                name: 'should only accept objects with matching schema',
                args: [{ prop: 'wrong prop' }],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ITEM_SCHEME',
                    message: `Zombie item must match { id: Number, name: String }. Check item at index 0`
                }
            },
            {
                name:
                    'should only accept objects with matching schema that exist in the default DB',
                args: [{ id: 2, name: 'Diamond Sword' }],
                expectation: {
                    result: false,
                    errorName: 'ITEM_NAME_INVALID',
                    message: `Zombie item name must be one of [{"id":1,"name":"Diamond Sword"},{"id":2,"name":"Trident"},{"id":3,"name":"Wooden Hoe"},{"id":4,"name":"Fishing Rod"},{"id":5,"name":"Elytra"},{"id":6,"name":"Blue Bed"},{"id":7,"name":"Toten of Undying"},{"id":8,"name":"Spawn Egg"},{"id":9,"name":"Leather Boots"},{"id":10,"name":"Horse Saddle"},{"id":11,"name":"Tonic"},{"id":12,"name":"Knowledge Book"},{"id":13,"name":"Flower Pot"},{"id":14,"name":"Enchanted Book"},{"id":15,"name":"Brown Glow Stick"}]. Check item at index 0`
                }
            }
        ]
    },
    {
        theFunction: validators.validateZombieItems,
        specs: [
            {
                name: 'should only accept an array',
                args: [{}],
                expectation: {
                    result: false,
                    errorName: 'ITEMS_MUST_BE_AN_ARRAY',
                    message: 'Zombie items must be an array'
                }
            },
            {
                name:
                    'should only accept an array of valid items. And should show the index of the culprit item',
                args: [[{ id: 1, name: 'Diamond Sword' }, {}]],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ITEM_SCHEME',
                    message:
                        'Zombie item must match { id: Number, name: String }. Check item at index 1'
                }
            },
            {
                name: 'should accept up to five items',
                args: [[1, 2, 3, 4, 5, 6, 7]],
                expectation: {
                    result: false,
                    errorName: 'TOO_MANY_ITEMS',
                    message: 'A zombie can have up to 5 items'
                }
            }
        ]
    },
    {
        theFunction: validators.validateZombie,
        specs: [
            {
                name: 'should validate the name',
                args: [{ name: { 'some bad name': 'hello' } }],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_NAME',
                    message: 'Zombie name must be a string'
                }
            },
            {
                name: 'accept a zombie without items',
                args: [{ name: 'good name' }],
                expectation: {
                    result: true
                }
            },
            {
                name: 'validate items array if it is provided',
                args: [
                    { name: 'good name', items: [{ 'but some bad item': 1 }] }
                ],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ITEM_SCHEME',
                    message: `Zombie item must match { id: Number, name: String }. Check item at index 0`
                }
            }
        ]
    },
    {
        theFunction: validators.validateZombieMutation,
        specs: [
            {
                name: 'should not allow id mutation',
                args: [{ id: 2 }],
                expectation: {
                    result: false,
                    errorName: 'ZOMBIE_ID_CANNOT_BE_UPDATED',
                    message:
                        'Zombie id is automatically generated and cannot be updated manually'
                }
            },
            {
                name: 'should not allow creationDate mutation',
                args: [{ creationDate: 2 }],
                expectation: {
                    result: false,
                    errorName: 'ZOMBIE_CREATION_DATE_CANNOT_BE_CHANGED',
                    message: `Zombie's creation date is automatically generated and cannot be updated manually`
                }
            },
            {
                name:
                    'should assert mutation object having either `name` or `items`',
                args: [{}],
                expectation: {
                    result: false,
                    errorName: 'INVALID_ZOMBIE_MUTATION',
                    message: `You need to mutate at least one of the desired zombie's props [name, items]`
                }
            },
            {
                name: 'should allow mutating name',
                args: [{ name: 'new name' }],
                expectation: {
                    result: true
                }
            },
            {
                name: 'should not allow mutating items with too many items',
                args: [{ items: [1, 2, 3, 4, 5, 6, 7, 8] }],
                expectation: {
                    result: false,
                    errorName: 'TOO_MANY_ITEMS',
                    message: 'A zombie can have up to 5 items'
                }
            }
        ]
    },
    {
        theFunction: validators.validateZombieDeletions,
        specs: [
            {
                name: 'should require at least one deletion',
                args: [
                    [
                        /* empty deletion criterium */
                    ]
                ],
                expectation: {
                    result: false,
                    errorName: 'NO_ZOMBIES_DELETED',
                    message:
                        'Could not find any zombies under the provided criteria'
                }
            }
        ]
    }
];

/* run all the specs in one place for DRYer code */
describe('Vaildators', async () => {
    specs.forEach(validator => {
        context(validator.theFunction.name, () => {
            validator.specs.forEach(spec => {
                it(spec.name, () => {
                    const result = validator.theFunction(...spec.args);
                    const expectedResult = spec.expectation;
                    
                    // check the assertion
                    assert.deepEqual(result, expectedResult);
                });
            });
        });
    });
});
