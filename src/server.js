var restify = require('restify'),
    _ = require('underscore'),
    fs = require('fs'),
    LogModule = require('./modules/log/module.js'),
    Log = new LogModule(),
    ConfigModule = require('./modules/config/module.js'),
    Config = new ConfigModule();


var server = restify.createServer();

function buildContentPath() {
    var pieces = '';
    _.each(arguments, function(arg){
        pieces += '/' + arg;
    });
    return './' + Config.get('contentPath') + pieces;
}

function getArticleList(year, month, callback) {
    fs.readFile(buildContentPath(year, month) + '/articles.json', {
        encoding: 'utf8'
    }, function(err, data){
        if(err) {
            throw err;
        }
        callback(JSON.parse(data));
    });
}

function getArticle(year, month, filename, callback) {
    fs.readFile(buildContentPath(year, month) + '/' + filename, {
        encoding: 'utf8'
    }, function(err, data){
        if(err) {
            throw err;
        }
        callback(data);
    });
}

function standardizeYear(year) {
    return '2014';
}

function standardizeMonth(month) {
    return month;
}

function getArticleListForYear(year, callback) {
    var articleList = {},
        months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        monthCounter = 0,
        contentPath = buildContentPath(year) + '/';

    _.each(months, function(month){
        if(fs.existsSync(contentPath + month + '/articles.json')) {
            getArticleList(year, month, function(data){
                monthCounter++;
                if(data) {
                    articleList[month] = data;
                }

                if(monthCounter === 12) {
                    callback(articleList);
                }
            });
        }
        else {
            monthCounter++;
        }
    });
};

server.use(function(req, res, next){
    if(Config.isEnv('dev')) {
        var colors = require('colors');
        console.log(req.route.method.bold + ' ' + req.url.green);
    }
    next();
});

server.get('/articles', function(req, res){
    // this endpoint is the exact same as getting all articles for the current 
    // year
    var date = new Date(),
        year = standardizeYear(date.getFullYear());

    getArticleListForYear(year, function(articleList){
        res.send(articleList);
    });

});

server.get('/articles/:year', function(req, res){
    // get every folder in the year place
    var year = standardizeYear(req.params.year);

    getArticleListForYear(year, function(articleList){
        res.send(articleList);
    });
});

server.get('/articles/:year/:month', function(req, res){
    // get the article.json file for this
    var year = standardizeYear(req.params.year),
        month = standardizeMonth(req.params.month);

    getArticleList(year, month, function(articleList){
        res.send(articleList);
    });
});

server.get('/articles/:year/:month/:articleID', function(req, res){
    var year = standardizeYear(req.params.year),
        month = standardizeMonth(req.params.month),
        articlePointer; 

    getArticleList(year, month, function(articleList){
        articlePointer = articleList[req.params.articleID];
        if(!_.isUndefined(articlePointer)) {
                getArticle(year, month, articlePointer.file, function(data){
                res.setHeader('content-type', 'text/plain');
                res.send(data);
            });
        }
        else {
            res.send(404);
        }
    });
});

server.listen(Config.get('server.port'), function(){
    Log.debug('Waiting on [' + Config.get('server.port') + ']');
});
