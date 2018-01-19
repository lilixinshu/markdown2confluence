var express = require("express"),
    path = require("path"),
    http = require("http"),
    compress = require('compression'),
    app = express(),
    server;

var config = {
    name: 'Convert Markdown To confluence',
    host: '127.0.0.1', //静态服务器域名
    port: 9001 //静态服务器端口
}

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// GZIP压缩
app.use(compress());

//静态文件路径(src/目录下)，须在响应头设置之后，否则仍将为默认值
app.use(express.static(path.join(__dirname, 'browser')));

server = http.createServer(app);

//路由配置
// 首页
app.get('/', function (req, res) {
    res.render('index.html');
});


// 监听服务器
server.listen(config.port, config.host, function () {
    console.log('Server listening on: ' + config.host + ', port ' + config.port);
});