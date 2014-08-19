var _ = require('underscore'),
    ConfigService = require('../service.js');


exports.testGetEnvironment = function(test) {
    test.expect(1);
    var Config = new ConfigService();
    
    test.equal(Config.getEnv(), 'dev');
    test.done();
}

exports.testPathWalking = function(test) {
    test.expect(1);
    var Config = new ConfigService();

    test.equal(Config.get('server.host'), 'localhost');
    test.done();
}

exports.testHotLoadedConfig = function(test) {
    test.expect(1);

    var moddedConfig = {
        'env': 'superposed'
    };


    var Config = new ConfigService(moddedConfig);

    test.equal(Config.getEnv(), 'superposed');

    test.done();
}
