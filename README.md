# Extension-Store

Cross-platform extension storage wrapper

## Installation

```bash
npm install extension-store
```

## Usage

```js
const { Storage } = require('extension-store');

const storage = new Storage('v0.1.0');

storage.set('key', 'value');
storage.set('another-key', { value: 'an object' });
storage.get('key');
storage.get('another-key');
```
