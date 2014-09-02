var md = require('marked');

md.setOptions({
    sanitize: false,
    highlight: function(code, lang, callback) {
        require('pygmentize-bundled')({
            lang: lang, format: 'html'
        }, code, function(err, result) {
            callback(err, result.toString());
        });
    }
});

exports.transform = function(data, callback){
    return md(data, function(err, content){
        if(err) {
            throw err;
        }
        callback(content);
    });
};
