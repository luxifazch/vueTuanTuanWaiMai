var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const sms_util = require('../util/sms_util')
const users = {}
const ajax = require('../api/ajax')
var svgCaptcha = require('svg-captcha')

/*
密码登陆
 */
router.post('/login_pwd', function (req, res) {
  const name = req.body.name
  const pwd = md5(req.body.pwd)
  const captcha = req.body.captcha.toLowerCase()
  console.log('/login_pwd', name, pwd, captcha, req.session)

  // 可以对验证码格式进行检查, 如果非法, 返回提示信息
  if(captcha!==req.session.captcha) {
    return res.send({code: 1, msg: '验证码不正确'})
  }
  // 删除保存的验证码
  delete req.session.captcha

  // 可以对用户名/密码格式进行检查, 如果非法, 返回提示信息
  if (name!=='abc') {
    return res.send({code: 1, msg: '用户名不正确'})
  } else if (pwd!==md5('123')) {
    return res.send({code: 1, msg: '密码不正确'})
  } else {
    req.session.userid = 1
    req.session.username = name
    return res.send({code: 0, data: {_id: 1, name: name}})
  }
})

/*
一次性图形验证码
 */
router.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({
    ignoreChars: '0o1l', //验证码字符中排除0o1l
    noise: 2, //噪声线条数
    color: true //验证的字符是否有颜色，默认没有，如果设置了背景，则默认有
  });
  req.session.captcha = captcha.text.toLowerCase(); //session存储验证码值，忽略大小写
  console.log(req.session.captcha)
  res.type('svg');//响应的类型
  res.send(captcha.data)
});

/*
发送验证码短信(缺少数据库的暂时处理)
*/
var smsCode = '';
router.get('/sendcode', function (req, res) {
  //1. 获取请求参数数据
  var phone = req.query.phone;
  //2. 处理数据
  //生成验证码(6位随机数)
  var code = sms_util.randomCode(6);
  //发送给指定的手机号
  console.log(`向${phone}发送验证码短信: ${code}`);
  sms_util.sendCode(phone, code, function (success) {//success表示是否成功
    if (success) {
      users[phone] = code
      console.log('保存验证码: ', phone, code)
      res.send({"code": 0})
    } else {
      
      //3. 返回响应数据
      res.send({"code": 1, msg: '短信验证码发送失败'})
    }
  })
})

/*
短信登陆
*/
router.post('/login_sms', function (req, res) {
  var phone = req.body.phone;
  var code = req.body.code;
  console.log('/login_sms', phone, code);
  //if (users[phone] != code) {
  if (smsCode==code) {
    return res.send({code: 1, msg: '手机号或验证码不正确'});
  } else {
    req.session.userid = 2
    req.session.userphone = phone
    return res.send({code: 0, data: {_id: 2,phone: phone}});
  }
})

/*
根据sesion中的userid, 查询对应的user
 */
router.get('/userinfo', function (req, res) {
  // 取出userid
  const userid = req.session.userid
    if (!userid) {
      // 清除浏览器保存的userid的cookie
      delete req.session.userid

      res.send({code: 1, msg: '请先登陆'})
    } else if (userid==1) {
      res.send({code: 0, data: {_id: 1, name: req.session.username}})
    } else if (userid==2) {
      res.send({code: 0, data: {_id: 2, phone: req.session.userphone}})
    }
  
})

router.get('/logout', function (req, res) {
  // 清除浏览器保存的userid的cookie
  delete req.session.userid
  delete req.session.username
  delete req.session.userphone
  // 返回数据
  res.send({code: 0})
})




/*
根据经纬度获取位置详情
 */
router.get('/position/:geohash', function (req, res) {
  const {geohash} = req.params
  ajax(`http://cangdu.org:8001/v2/pois/${geohash}`)
    .then(data => {
      res.send({code: 0, data})
    })
})
/*
获取首页食品轮播分类列表
 */
router.get('/index_category', function (req, res) {
  setTimeout(function () {
    const data = require('../data/index_category.json')
    res.send({code: 0, data})
  }, 300)
})
/*
获取商铺列表
 */
router.get('/shops', function (req, res) {
  setTimeout(function () {
    const data = require('../data/shops.json')
    res.send({code: 0, data})
  }, 300)
})

router.get('/search_shops', function (req, res) {
  const {geohash, keyword} = req.query
  ajax('http://cangdu.org:8001/v4/restaurants', {
    'extras[]': 'restaurant_activity',
    geohash,
    keyword,
    type: 'search'
  }).then(data => {
    res.send({code: 0, data})
  })
})

module.exports = router;
