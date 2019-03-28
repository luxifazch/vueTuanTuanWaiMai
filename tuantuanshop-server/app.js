//引包
var express = require('express');

var path = require('path');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

//加载路由文件
var index = require('./routes/index');

//创建服务器应用程序
var app = express();


//加载日志的中间件
app.use(logger('dev'));

//配置bodyParser(用来解析post表单请求体)
app.use(bodyParser.json());
//配置bodyParser(用来解析urlencoded请求体的中间件。post请求)
app.use(bodyParser.urlencoded({ extended: false }));

//设置public文件夹为放置静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

//加载解析cookie的中间件
app.use(cookieParser());

app.use(session({
  secret: 'luxifa',
  cookie: {maxAge: 1000*60*60*24 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  resave: false,
  saveUninitialized: true,
}));

//路由控制器
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development（设置局部变量，只提供开发中的错误）
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page(渲染错误页面)
  res.status(err.status || 500);
  res.render('error');
});

//把app导出，别的地方就可以通过require（"app")获取到这个对象
module.exports = app;
