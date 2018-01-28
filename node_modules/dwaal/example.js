const Storage = require('./');

const storage = new Storage({ path: './data' });
storage.get('test')
	.then(v => {
		console.log('Key is currently', v);
		return storage.set('test', v ? v + 1 : 1);
	})
	.catch(err => console.log('Error occurred', err));
