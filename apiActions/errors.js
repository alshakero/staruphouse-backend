module.exports = {
    _sendError(res, error) {
        res.status(error.status);
        res.send(JSON.stringify(error));
    },
    ZOMBIE_NOT_FOUND(res, id) {
        this._sendError(res, {
            error: 'ZOMBIE_NOT_FOUND',
            message: `There is no zombie under the id ${id}`,
            status: 404
        });
    },
    ZOMBIE_ITEM_NOT_FOUND(res, index) {
        this._sendError(res, {
            error: 'ZOMBIE_ITEM_NOT_FOUND',
            message: `There is no zombie item under the index ${index}`,
            status: 404
        });
    },
    VALIDATION_ERROR(res, validateResult, status = 422) {
        this._sendError(res, {
            error: validateResult.errorName,
            message: validateResult.message,
            status
        });
    },
};
