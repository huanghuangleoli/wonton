Wonton, mongodb + RESTful api
=======

Files
------
* entrypoint.js
    * Launches the app `$ node entrypoint.js`
    * Defines port number.
* server.js
    * Calls `http.createServer`
* database.js
    * Defines `clearDB()`, `initDB()`, `loadFromJsonFile()`
* requestHandlers.js
    * Defines `handles`, a map for routing.
* router.js
    * Calls `handles[pathname]`
    * Writes 404 for invalid url.
* resource_actions
    * RESTapi for each pathname
    * `foo.js` is for path /foo?id=10000

