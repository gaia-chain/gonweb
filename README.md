# gonweb - GON JavaScript SDK

## Installation

### Node.js
```bash
npm install gonweb
```
or
```bash
yarn add gonweb
```

### Browser
First, don't use the release section of this repo, it has not updated in a long time.

Then easiest way to use GonWeb in a browser is to install it as above and copy the dist file to your working folder. For example:
```
cp node_modules/gonweb/dist/GonWeb.js ./js/GonWeb.js
```
so that you can call it in your HTML page as
```
<script src="./js/GonWeb.js"><script>
```

## Creating an Instance

First off, in your javascript file, define GonWeb:

```js
const GonWeb = require('gonweb')
```

When you instantiate GonWeb you can define

* fullNode
* privateKey


```js
const gonWeb = new GonWeb({
    fullHost: 'https://testnet.gonscan.com/v1/api/',
    privateKey: 'your private key'
})
```

## Contributions

In order to contribute you can

* fork this repo and clone it locally
* install the dependencies — `npm i`
* do your changes to the code
* build the GonWeb dist files — `npm run build`
* push your changes and open a pull request
