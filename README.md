<h1 align="center">
  <br>
    <img src="logo.svg" width="200" />
  <br>
  Zombies API
  <br>
</h1>

<h4 align="center">This service serves an API of zombies and their items. All needed CRUD operations are available for both `zombies` and their `items`</h4>

## Endpoints

### Zombies Endpoint

#### `GET` `/zombies`
Returns an array containing all recorded zombies
#### `POST` `/zombies`
Creates and returns a new zombie object
#### `GET` `/zombies/:id`
Retrieves a zombie object with total items value, by zombie's id
#### `PUT` `/zombies/:id`
Updates a zombie by its id, accepts a JSON body representing the mutation object. It merges your mutation object with the object in the DB. Returns the updated object
#### `DELETE` `/zombies/:id`
Deletes a zombie by its id and returns `{result: success}`

### Zombie Items Endpoints

#### `GET` `/zombies/:id/items`
Returns an array represting all zombie's items
#### `PUT` `/zombies/:id/items`
Accepts a PUT request to replace the whole items array of in given zombie. Returns the updated zombie
#### `PATCH` `/zombies/:id/items`
Accepts a PATCH request to insert a single new item in given zombie's items. Returns the updated zombie
#### `GET` `/zombies/:id/items/:item_index`
Returns a single zombie's item selected at the given index. Note that item's index should not be confused with item's id.
#### `DELETE` `/zombies/:id/items/:item_index`
Deletes a zombie's item at the provided index

## Development

### Running the app

To run this app, you need to clone this repository and in its DIR do:

1. `yarn` or `npm i`.
2. `yarn start`.

The app will listen on port 3000 by default.

### Testing the solution

To run the tests, assuming you already did `yarn` or `npm`i, all you need to do is to run `yarn test` or `npm run test`.

### Technologies used

1. I used [`lowdb`](https://github.com/typicode/lowdb) as database for simplicity.
2. I used [`node-fetch`](https://github.com/bitinn/node-fetch) for easy promisified HTTP requests.
3. I cached exchange rates for 1 hour.
4. I cached zombie items for the whole 24h of their lifespan.
5. I used [`supertest`](https://github.com/visionmedia/supertest) to test the API.
6. I used [`mocha`](https://mochajs.org/#installation) for assertions and general testing.

### Note on building docs

_Please do not modify this file manually. It's automatically generated by running `npm run build-docs`. To modify it, you can either edit `tools/readme_source.md` or route descriptions under `apiActions` directory._

### Feedback

Please note that the `/today` endpoint of NBP doesn't work on bank holidays as transfer rates are not updated. I had to use `https://api.nbp.pl/api/exchangerates/tables/C/?format=json` endpoint instead. It returns the latest available exchange rates.

### License

MIT
