## Strapi.IO

Module for working with socket.io with predefined rules. Strapi.IO will look at Role permission on each action.

## Installation
```bash
yarn add raudinm/strapi.io
```
Or using npm:
```bash
npm i raudinm/strapi.io
```

`config/functions/bootstrap.js`
```js
process.nextTick(() => {
    strapi.StrapIO = new (require('strapi.io'))(strapi);
});
```

## Usage

### Server
`api/<content-type>/models/<content-type.js`
```js
module.exports = {
  lifecycles: {
    // Called after an entry is created
    afterCreate(result, data) {
        strapi.StrapIO.emit(CONTENTYPE, 'create', result);
    },

    // Called after an entry is updated
    afterUpdate(result, params, data) {
        strapi.StrapIO.emit(CONTENTYPE, 'update', result);
    },
  },
}
```
### Client

```js
const io = require('socket.io-client');

// Handshake required, token will be verified against strapi
const socket = io.connect(API_URL, {
    extraHeaders: { token }
});

socket.on('create', data => {
    //do something
});
socket.on('update', data => {
    // do something
});
```

## Test
Currently tested with:
```js
{
    "strapi": "3.3.4",
    "strapi-plugin-users-permissions": "3.3.4"
}
```
