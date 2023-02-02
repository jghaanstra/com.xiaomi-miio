'use strict';

const Thing = require('../thing');
const State = require('../common/state');
const { code } = require('../values');

/**
 * Actions, such as switches and remote controls.
 */
module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'actions';
	}

	static availableAPI(builder) {
		builder.state('actions')
			.description('Actions that the controller can emit')
			.type('array')
			.done();

		builder.event('actions')
			.description('The supported actions have changed')
			.type('array')
			.done();

		builder.event('action')
			.description('A certain action has been triggered')
			.type('object')
			.done();

		builder.event('action:<id>')
			.description('Action with the given id has been triggered')
			.done();

		builder.action('actionsChanged')
			.description('Get the actions that this controller can emit')
			.returns('array')
			.done();
	}

	constructor(...args) {
		super(...args);

		this.updateState('actions', []);
	}

	/**
	* Emit the given action for this controller.
	*
	* @param {string} action
	*/
	emitAction(action, extra={}) {
		this.emitEvent('action', { action: action, data: extra }, { multiple: true });
		this.emitEvent('action:' + action, extra, { multiple: true });
	}

	/**
	 * Get the available actions for this controller. All of these actions
	 * can be emitted.
	 */
	actions() {
		return Promise.resolve(this.getState('actions'));
	}

	/**
	 * Update the available actions of the controller.
	 */
	updateActions(actions) {
		let mapped = [];
		for(const a of actions) {
			mapped.push(code(a));
		}

		if(this.updateState('actions', mapped)) {
			this.emitEvent('actionsChanged', mapped);
		}
	}
});
