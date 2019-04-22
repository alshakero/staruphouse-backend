Hi Omar!

just as we talked below you will find a task:

Language and framework: JavaScript (Node.JS)

Hey, hey, hey!
We would like you to write us an API!

Let's create a zombie, which will be equipped with valuable equipment.
In order to do that we need a few endpoints:
1. CRUD for zombies 
2. CRUD for items in our form

Assumptions:

- a zombie can have a maximum of 5 items
- we use an external item exchange for our zombie (we pay for each request - maybe a cache?), the prices of items on the stock exchange are updated daily at 00:00 UTC and are given in Polish zlotys. https://zombie-items-api.herokuapp.com/api/items
- we use API NBP to download daily exchange rates http://api.nbp.pl/api/exchangerates/tables/C/today/

What do we want to achieve?

We are creating a business card for our zombie, the man from the front has already made everything great and is waiting for the API with the documentation.

On the business card we need to display:

- name of the zombie
- the date of establishment
- item list
- total value of items in 3 currencies, PLN/EUR/USD - values calculated on the backend
- application must be hosted, it can be herok/zeit or anything else

What's important?

- good documentation
- coverage test
- optimization
- clean code

Good luck! 

