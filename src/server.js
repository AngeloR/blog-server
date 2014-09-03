var restify = require('restify'),
    _ = require('underscore'),
    fs = require('fs'),
    buffer = require('buffer'),
    LogModule = require('./modules/log/module.js'),
    Log = new LogModule(),
    ConfigModule = require('./modules/config/module.js'),
    Config = new ConfigModule(),
    RendererModule = require('./modules/renderer/module.js'),
    Renderer = new RendererModule();


var apiServer = restify.createServer();

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
    if(fs.existsSync(buildContentPath(year, month) +'/' + filename)) {
        fs.readFile(buildContentPath(year, month) + '/' + filename, {
            encoding: 'utf8'
        }, function(err, data){
            if(err) {
                throw err;
            }
            callback(data);
        });
    }
    else {
        callback({});
    }
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

apiServer.use(restify.CORS());

apiServer.use(function(req, res, next){
    if(Config.isEnv('dev')) {
        var colors = require('colors');
        console.log(req.route.method.bold + ' ' + req.url.green);
    }
    next();
});

apiServer.get('/articles', function(req, res){
    // this endpoint is the exact same as getting all articles for the current 
    // year
    var date = new Date(),
        year = standardizeYear(date.getFullYear());

    getArticleListForYear(year, function(articleList){
        res.send(articleList);
    });

});

apiServer.get('/articles/:year', function(req, res){
    // get every folder in the year place
    var year = standardizeYear(req.params.year);

    getArticleListForYear(year, function(articleList){
        res.send(articleList);
    });
});

apiServer.get('/articles/:year/:month', function(req, res){
    // get the article.json file for this
    var year = standardizeYear(req.params.year),
        month = standardizeMonth(req.params.month);

    getArticleList(year, month, function(articleList){
        res.send(articleList);
    });
});

apiServer.get('/articles/:year/:month/:articleSlug', function(req, res){
    var year = standardizeYear(req.params.year),
        month = standardizeMonth(req.params.month),
        articlePointer; 

    getArticleList(year, month, function(articleList){
        _.each(articleList, function(article){
            if(article.slug === req.params.articleSlug) {
                articlePointer = article;
            }
        });

        if(!_.isUndefined(articlePointer)) {
                getArticle(year, month, articlePointer.file, function(data){

                Renderer.transform('markdown', data, function(parsedData){
                    res.setHeader('content-type', 'text/html');
                    res.send(parsedData);
                });
            });
        }
        else {
            res.send(404);
        }
    });
});

apiServer.listen(Config.get('apiServer.port'), function(){
    Log.debug('apiServer started on [' + Config.get('apiServer.port') + ']');
});
