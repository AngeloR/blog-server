var _ = require('underscore'),
    events = require('events'),
    ConfigService = require('../config/module.js');

LogModule.prototype.__proto__ = events.EventEmitter.prototype;

function LogModule() {
    var self = this;

    this.Config = new ConfigService();
    events.EventEmitter.call(this);

    function isDev() {
        return _.isEqual(self.Config.getEnv(), 'dev');
    }

    function emit(event, args) {
        var _args = [event];

        _.each(args, function(arg){
            _args.push(arg);
        });

        self.emit.apply(self, _args);
    }

    this.debug = function() {
        if(isDev()) {
            console.log.apply(null, arguments);
        }
    };

    this.error = function() {
        if(isDev()) {
            self.debug.apply(self, arguments);
        }

        emit('error', arguments);
    };

    this.critical = function() {
        if(isDev()) {
            self.debug.apply(self, arguments);
        }

        emit('critical', arguments);
    };
}


module.exports = LogModule;
