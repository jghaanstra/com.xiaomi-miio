# tinkerhub-discovery

This library contains a standarized API for building discovery mechanisms. It
is intended to be used to implement some sort of discovery mechanism, such
as those for [SSDP](https://github.com/tinkerhub/tinkerhub-ssdp) and
[MDNS](https://github.com/tinkerhub/tinkerhub-mdns).

The library is made available via NPM:

```
npm install tinkerhub-discovery
```

## API

Two basic functionality of a discovery instance is the two events `available`
and `unavailable`. Listeners can be added as such:

```javascript
discovery.on('available', service => console.log('Service available', service));
discovery.on('unavailable', service => console.log('Service unavailable', service));
```

Its also possible to list services that are currently known:

```javascript
console.log(discovery.services);
```

All implementations that use this library as a base will have functions to
filter and map services. This is useful do things like this:

```javascript
ssdpDiscovery.filter(service => service.headers['HUE-BRIDGEID'])
	.map(service => {
		service.id = service.headers['HUE-BRIDGEID'];
		return service;
	});
```

Where all SSDP devices are filtered and then the `id` is changed to be that
of the Philips Hue bridge instead of the normal SSDP id.

## Building a custom discovery

There are a few ways to build a custom discovery, with the two main ways being:

* Event-based discovery, services are added or removed when changed
* Sync-based discovery, services are discovered in bulk 

A very basic example would be this discovery that listens for incoming UDP
packets and just adds them as services:

```javascript
const { BasicDiscovery, addService } = require('tinkerhub-discovery');

class CustomDiscovery extends BasicDiscovery {
  static get type() {
    return 'typeForDebug';
  }
	
  constructor() {
    super();
  }

  start() {
    super.start();

    this.socket = dgram.createSocket('udp4');
    this.socket.bind();
    this.socket.on(12345, '224.1.1.1', 'listening', () => )
    this.socket.addMembership('224.1.1.1');
      this.socket.setBroadcast(true);
    });
    this.socket.on('message', msg => {
      // Parse incoming message here
      const service = {
	    id: extractSomeSortOfId(msg),
        message: msg
      };

      // Add it to the list of services
      this[addService](service);
    });
  }

  stop() {
    this.socket.destroy();

    super.stop();
  }
}
```

The above discovery would never remove any services, but extending
`ExpiringDiscovery` would activate time based and remove services based on when
they were last seen:

```javascript
const { ExpiringDiscovery, addService } = require('tinkerhub-discovery');

class CustomDiscovery extends ExpiringDiscovery {
  static get type() {
    return 'typeForDebug';
  }
	
  constructor() {
    super({
      maxStaleTime: 60*1000 /* milliseconds */
    });
  }

  start() {
    super.start();

    this.socket = dgram.createSocket('udp4');
    this.socket.bind();
    this.socket.on(12345, '224.1.1.1', 'listening', () => )
    this.socket.addMembership('224.1.1.1');
      this.socket.setBroadcast(true);
    });
    this.socket.on('message', msg => {
      // Parse incoming message here
      const service = {
	    id: extractSomeSortOfId(msg),
        message: msg
      };

      // Add it to the list of services
      this[addService](service);
    });
  }

  stop() {
    this.socket.destroy();

    super.stop();
  }
}
```
