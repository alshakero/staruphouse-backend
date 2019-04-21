/**
 * Check if a given value `n` falls between `min` and `max` inclusively
 * @param {Number} n the value
 * @param {Number} min the lower limit
 * @param {Number} max the upper limit
 */
function inRange(n, min, max) {
    return n >= min && n <= max;
}

/**
 * Validates the zombie name
 * @param {String} name the zombie name you want to validate
 * @return {ValidationResult} the validation result
 */
function validateZombieName(name) {
    if (!name) {
        return {
            result: false,
            errorName: 'INVALID_ZOMBIE_NAME',
            message: 'Zombie must have a name'
        };
    }

    if (typeof name !== 'string') {
        return {
            result: false,
            errorName: 'INVALID_ZOMBIE_NAME',
            message: 'Zombie name must be a string'
        };
    }

    if (!inRange(name.length, 1, 32)) {
        return {
            result: false,
            errorName: 'INVALID_ZOMBIE_NAME',
            message: 'Zombie name must be 1-32 charactors in length'
        };
    }
    return { result: true };
}

/**
 * Validates the zombie items
 * @param {Array} items the zombie items you want to validate
 * @return {ValidationResult} the validation result
 */
function validateZombieItems(items) {
    if (!Array.isArray(items)) {
        return {
            result: false,
            errorName: 'ITEMS_MUST_BE_AN_ARRAY',
            message: 'Zombie items must be an array'
        };
    }

    if (!inRange(items.length, 0, 5)) {
        return {
            result: false,
            errorName: 'TOO_MANY_ITEMS',
            message: 'A zombie can have up to 5 items'
        };
    }

    return { result: true };
}

/**
 * The JSDoc type for ValidationResult
 * @typedef {Object} ValidationResult
 * @property {Boolean} result Represents if said validation passed
 * @property {String} [errorName] A string containing the canonical error name. Only populated when @result is `false`.
 * @property {String} [message] A string explaining the error in detail. Only populated when @result is `false`.
 */

/**
 * Validate a given zombie object
 * @param {Object} zombie an object represting a full zombie object
 * @return {ValidationResult} the result of the validation
 */
function validateZombie(zombie) {
    if ('id' in zombie) {
        return {
            result: false,
            errorName: 'ZOMBIE_ID_CANNOT_BE_SET',
            message:
                'Zombie id is automatically generated and cannot be set manually'
        };
    }

    const nameValidation = validateZombieName(zombie.name);

    if (!nameValidation.result) {
        return nameValidation;
    }

    // `items` is optional
    if ('items' in zombie) {
        const itemsValidation = validateZombieItems(zombie.items);
        if (!itemsValidation.result) {
            return itemsValidation;
        }
    }

    return {
        result: true
    };
}

/**
 * Validate a given zombie object mutation
 * @param {Object} zombieMutation an object represting a partial or full zombie object
 * @return {ValidationResult} the result of the validation
 */
function validateZombieMutation(zombieMutation) {
    if ('id' in zombieMutation) {
        return {
            result: false,
            errorName: 'ZOMBIE_ID_CANNOT_BE_UPDATED',
            message:
                'Zombie id is automatically generated and cannot be updated manually'
        };
    }

    if (!('name' in zombieMutation) && !('items' in zombieMutation)) {
        return {
            result: false,
            errorName: 'INVALID_ZOMBIE_MUTATION',
            message:
                `You need to mutate at least one of the desired zombie's props [name, items]`
        };
    }

    if ('name' in zombieMutation) {
        const nameValidation = validateZombieName(zombieMutation.name);
        if (!nameValidation.result) {
            return nameValidation;
        }
    }
    // `items` is optional
    if ('items' in zombieMutation) {
        const itemsValidation = validateZombieItems(zombieMutation.items);
        if (!itemsValidation.result) {
            return itemsValidation;
        }
    }

    return {
        result: true
    };
}
/**
 *
 * @param {Array<Object>} deletedZombies An array that should contain the deleted zombies
 * @return {ValidationResult} the result of the validation
 */
function validateZombieDeletions(deletedZombies) {
    if (deletedZombies.length === 0) {
        return {
            result: false,
            errorName: 'NO_ZOMBIES_DELETED',
            message: 'Could not find any zombies under the provided criteria'
        };
    }
    return {
        result: true
    };
}

module.exports = {
    validateZombie,
    validateZombieDeletions,
    validateZombieMutation
};
