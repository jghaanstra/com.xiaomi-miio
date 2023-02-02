'use strict';

class ActionBuilder {
	constructor(name, callback) {
		this._name = name;
		this._callback = callback;
		this._description = '';
		this._arguments = [];
		this._returnType = {
			type: 'mixed',
			description: ''
		};
		this._getterFor = null;
	}

	/**
	* Add a short description what the action does.
	*/
	description(description) {
		this._description = description || '';
		return this;
	}

	/**
	* Define what this action returns.
	*/
	returns(type, description) {
		this._returnType = {
			type: type,
			description: description
		};
		return this;
	}

	/**
	* Add a argument for the action.
	*/
	argument(type, optional, description) {
		if(typeof optional !== 'boolean') {
			description = optional;
			optional = false;
		}

		this._arguments.push({
			type: type,
			optional: optional,
			description: description || '',
		});

		return this;
	}

	getterForState(state) {
		this._getterFor = state;
		return this;
	}

	/**
	* Add this action and return to building the rest of the definition.
	*/
	done() {
		const def = {
			name: this._name,
			arguments: this._arguments,
			returnType: this._returnType
		};

		if(this._description) {
			def.description = this._description;
		}

		if(this._getterFor) {
			def.getterForState = this._getterFor;
		}

		return this._callback(def);
	}
}

class StateBuilder {
	constructor(name, callback) {
		this._name = name;
		this._callback = callback;
		this._description = '';
		this._type = 'mixed';
	}

	/**
	* Add a short description what the state is for.
	*/
	description(description) {
		this._description = description || '';
		return this;
	}

	/**
	* Define what this action returns.
	*/
	type(type) {
		this._type = type;
		return this;
	}

	done() {
		const def = {
			name: this._name,
			type: this._type
		};

		if(this._description) {
			def.description = this._description;
		}

		return this._callback(def);
	}
}

class EventBuilder {
	constructor(name, callback) {
		this._name = name;
		this._callback = callback;
		this._description = '';
		this._type = 'mixed';
	}

	/**
	* Add a short description what the state is for.
	*/
	description(description) {
		this._description = description || '';
		return this;
	}

	/**
	* Define what this action returns.
	*/
	type(type) {
		this._type = type;
		return this;
	}

	done() {
		const def = {
			name: this._name,
			type: this._type
		};

		if(this._description) {
			def.description = this._description;
		}

		return this._callback(def);
	}
}

class DefBuilder {
	constructor() {
		this._actions = {};
		this._events = {};
		this._state = {};
	}

	markWith(tags) {
		this._tags = tags;
	}

	action(name) {
		return new ActionBuilder(name, def => {
			const current = this._actions[name];
			if(current) {
				// TODO: Check compatibility, but for now ignore this action
				return this;
			}
			def.tags = this._tags;
			this._actions[name] = def;
			return this;
		});
	}

	event(name) {
		return new EventBuilder(name, def => {
			this._events[name] = def;
			def.tags = this._tags;
			return this;
		});
	}

	state(name) {
		return new StateBuilder(name, def => {
			this._state[name] = def;
			def.tags = this._tags;
			return this;
		});
	}

	done() {
		return {
			actions: this._actions,
			state: this._state,
			events: this._events
		};
	}
}

module.exports = DefBuilder;
