const Homey = require('homey');
const yeelight = require('/lib/yeelight.js');

module.exports = [
	{
		description: 'Toggle Yeelight Listener',
		method     : 'PUT',
		path       : '/yeelight/',
		public     : false,
		fn: function(args, callback) {
			yeelight.toggleListener(args, callback);
		}
	}
]
