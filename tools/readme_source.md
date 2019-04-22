# Zombies API

This service serves an API of zombies and their items. All needed CRUD operations are available for both `zombies` and their `items`.

## Endpoints

REPLACE_ME_WITH_API_DOCS

## Development

### Running the app

To run this app, you need to clone this repository and in its DIR do:

1. `yarn` or `npm i`.
2. `yarn start`.

The app will listen on port 3000 by default.

### Testing the solution
To run the tests, assuming you already did `yarn` or `npm `i, all you need to do is to run `yarn test` or `npm run test`.


### Note on Building docs
_Please do not modify this file manually. It's automatically generated by running `npm run build-docs`. To modify it, you can either edit `tools/readme_source.md` or route descriptions under `apiActions` directory._

### Feedback
Please note that the `/today` endpoint of NBP doesn't work on bank holidays as transfer rates are not updated. I had to use `https://api.nbp.pl/api/exchangerates/tables/C/?format=json` endpoint instead. It returns the latest available exchange rates.

### License
MIT
