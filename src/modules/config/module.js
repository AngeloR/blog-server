var _ = require('underscore');

function ConfigurationModule(settings) {

    var self = this,
        defaultPath = '../../../config/app.json',
        configFile;


    if(!_.isUndefined(settings)) {
        // ok, we have settings.. it's either a settings object.. or a pointer 
        // to a new file to load.
        if(_.isObject(settings)) {
            configFile = settings;
        }
        else {
            configFile = require(settings);
        }
    }
    else {
        configFile = require(defaultPath);
    }

    this.isEnv = function(testEnv) {
        return _.isEqual(testEnv, configFile.env);
    };

    this.getEnv = function() {
        return configFile.env;
    };

    this.get = function(path, root) {
        if(_.isUndefined(root)) {
            var root = configFile[self.getEnv()];
        }

        if(path) {
            var pieces = path.split('.');
            if(pieces.length > 0) {
                var segment = pieces.shift();
                if(!_.isUndefined(root[segment])) {
                    root = root[segment];
                    return self.get(pieces.join('.'), root);
                }
                else {
                    return root;
                }
            }
            else {
                return root;
            }
        }
        else {
            return root;
        }
    }
}

module.exports = ConfigurationModule;
