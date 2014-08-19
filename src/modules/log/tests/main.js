var _ = require('underscore'),
    LogService = require('../service.js');


exports.testCriticalEventHandler = function(test) {
    test.expect(2);

    var Log = new LogService();
    Log.on('critical', function(d1, d2){
        test.equal(d1, 's1');
        test.equal(d2, 's2');
        test.done();
    });

    Log.critical('s1', 's2');
}
