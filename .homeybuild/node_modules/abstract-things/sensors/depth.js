'use strict';

const Thing = require('../thing');
const Sensor = require('./sensor');
const { number } = require('../values');

module.exports = Thing.mixin(Parent => class extends Parent.with(Sensor) {
        static get capability() {
                return 'depth';
        }

        static availableAPI(builder) {
                builder.event('depthChanged')
                        .type('number')
                        .description('Depth has changed')
                        .done();

                builder.action('depth')
                        .description('Get the current depth')
                        .getterForState('depth')
                        .returns('number', 'Current depth')
                        .done();
        }

        get sensorTypes() {
                return [ ...super.sensorTypes, 'depth' ];
        }

        depth() {
                return this.value('depth');
        }

        updateDepth(value) {
                this.updateValue('depth', number(value));
        }
});
