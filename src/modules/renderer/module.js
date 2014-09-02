var _ = require('underscore'),
    fs = require('fs'),
    LogModule = require('../log/module.js'),
    Log = new LogModule(),
    ConfigModule = require('../config/module.js'),
    Config = new ConfigModule();


function RendererModule() {
    var self = this;

    this.renderers = {};

    this.isRenderer = function(renderer) {
        return !_.isUndefined(self.renderers[renderer]);
    };

    this.loadRenderer = function(renderer) {
        self.renderers[renderer.split('.js')[0]] = require('./' + renderer);
    };

    this.transform = function(renderer, content, callback) {
        if(!self.isRenderer(renderer)) {
            self.loadRenderer(renderer + '.js');
        }

        if(self.isRenderer(renderer)) {
            content = self.renderers[renderer].transform(content, callback);
        }
        else {
            throw InvalidRenderer;
        }
    };

    function construct() {
        var data = fs.readdirSync('./src/modules/renderer/');

        _.each(data, function(file){
            if(file !== 'module.js') {
                Log.debug('Using renderer: ' + file);
                self.loadRenderer(file);
            }
        });
    }
    construct();
}

module.exports = RendererModule;
