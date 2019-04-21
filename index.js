const express = require('express');
const expressInstance = express();
const zombieActions = require('./zombieActions');

const port = 3000;

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

zombieActions.forEach(action => {
    expressInstance[action.HTTPVerb](action.route, action.callback);
});



expressInstance.listen(port);
