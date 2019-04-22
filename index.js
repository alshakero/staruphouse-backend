const express = require('express');
const expressInstance = express();
const zombieActionsCreator = require('./apiActions/zombieActions');
const zombieItemsActionsCreator = require('./apiActions/zombieItemsActions');

function createApp() {
    expressInstance.use(
        express.json({
            inflate: true,
            limit: '1kb',
            strict: true,
            type: 'application/json'
        })
    );

    // add a middleware that sets Content-Type to JSON once and for all.
    // This makes the code DRYer.
    expressInstance.use(function(req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        next();
    });

    // serve `/` for elegance
    expressInstance.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(
            'Please check the project\'s <a href="https://github.com/alshakero/staruphouse-backend">README</a> for API docs.'
        );
    });

    /* register `zombies` end point actions */
    zombieActionsCreator().forEach(action => {
        expressInstance[action.HTTPVerb](action.route, action.callback);
    });

    /* register `zombies/items` end point actions */
    zombieItemsActionsCreator().forEach(action => {
        expressInstance[action.HTTPVerb](action.route, action.callback);
    });

    return expressInstance;
}

if (process.argv.includes('--listen')) {
    const port = 3000;
    createApp().listen(port, () => console.log(`Listening on ${port}`));
}

module.exports = createApp;
