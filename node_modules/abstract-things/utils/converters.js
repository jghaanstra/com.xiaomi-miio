'use strict';

function combine(first, second) {
	return function(value) {
		return second(first(value));
	};
}

class Converters {
	constructor() {
		this._conversions = [];
		this._cached = {};
	}

	add(from, to, converter) {
		if(from === to) return;

		const c = {
			count: 1,
			from: from,
			to: to,
			converter: converter
		};
		this._conversions.push(c);
		this._cached[from + '->' + to] = c;

		return this;
	}

	_converter(from, to) {
		const cached = this._cached[from + '->' + to];
		if(cached) {
			return cached.converter;
		}

		const checked = {};
		const queue = [];
		function insertIntoQueue(c) {
			if(c.from === c.to) return;

			const v = checked[c.from + '->' + c.to];
			if(v) return;
			checked[c.from + '->' + c.to] = true;

			const count = c.count;
			for(let i=0; i<queue.length; i++) {
				if(queue[i].count > count) {
					queue.splice(i, 0, c);
					return;
				}
			}

			queue.push(c);
		}

		this._conversions.forEach(c => {
			if(c.from === from) {
				insertIntoQueue(c);
			}
		});

		while(queue.length) {
			const item = queue.shift();

			if(item.to === to) {
				this._cached[from + '->' + to] = item;
				return item.converter;
			} else {
				this._conversions.forEach(c => {
					if(c.from === item.to) {
						insertIntoQueue({
							from: item.from,
							to: c.to,
							count: item.count + 1,
							converter: combine(item.converter, c.converter)
						});
					}
				});
			}
		}

		this._cached[from + '->' + to] = {
			converter: null
		};
		return null;
	}

	convert(from, to, value) {
		if(from === to) return value;

		const c = this._converter(from, to);
		if(! c) {
			throw new Error('No suitable conversion between ' + from + ' and ' + to);
		}

		return c(value);
	}
}

module.exports = function() {
	return new Converters();
};
