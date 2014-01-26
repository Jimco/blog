
/*
 * GET home page.
 */

var crypto = require('crypto')
  , fs = require('fs')
  , User = require('../models/user')
  , Post = require('../models/post')
  , Comment = require('../models/comment');

module.exports = function(app){

  // 首页
  // app.get('/', function (req, res) {
  //   Post.getAll(null, function(err, posts){
  //     if(err) posts = [];

  //     res.render('index', {
  //       title: '主页',
  //       user: req.session.user,
  //       posts: posts,
  //       success: req.flash('success').toString(),
  //       error: req.flash('error').toString()
  //     });
  //   });
  // });
  app.get('/', function(req, res){
    var page = req.query.p ? parseInt(req.query.p) : 1;

    Post.getTen(null, page, function(err, posts, total){
      if(err) posts = [];

      res.render('index', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) === 0,
        isLastPage: ((page - 1)*10 + posts.length) === total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });


  // 发布页面
  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user
      , tags = req.body.tags.split(' ') // [ req.body.tag1, req.body.tag2, req.body.tag3 ]
      , post = new Post(currentUser.name, currentUser.headface, req.body.title, tags, req.body.post);

    post.save(function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      req.flash('success', '发布成功！');
      res.redirect('/');
    });
  });


  // 编辑页面
  app.get('/edit/:_id', checkLogin);
  app.get('/edit/:_id', function(req, res){
    var currentUser = req.session.user;

    Post.edit(req.params._id, function(err, post){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/edit/:_id', checkLogin);
  app.post('/edit/:_id', function(req, res){

    Post.update(req.params._id, req.body.title, req.body.tags.split(' '), req.body.post, function(err){
      var url = '/post/' + req.params._id;

      if(err){
        req.flash('error', err);
        return res.redirect(url);
      }

      req.flash('success', '修改成功！');
      res.redirect(url);
    });
  });


  // 用户页面
  // app.get('/u/:name', function(req, res){
  //   User.get(req.params.name, function(err, user){
  //     if(!user){
  //       req.flash('error', '用户不存在！');
  //       return res.redirect('/');
  //     }

  //     // 查询并返回该用户的所有文章
  //     Post.getAll(user.name, function(err, posts){
  //       if(err){
  //         req.flash('error', err);
  //         return res.redirect('/');
  //       }

  //       res.render('user', {
  //         title: user.name,
  //         posts: posts,
  //         user: req.session.user,
  //         success: req.flash('success').toString(),
  //         error: req.flash('error').toString()
  //       })
  //     });
  //   });
  // });
  app.get('/u/:name', function(req,res){
    var page = req.query.p ? parseInt(req.query.p) : 1;

    User.get(req.params.name, function(err, user){
      if(!User){
        req.flash('error', '用户不存在！');
        return res.redirect('/');
      }

      Post.getTen(user.name, page, function(err, posts, total){
        if(err){
          req.flash('error', err);
          return res.redirect('/');
        }

        console.log('user page...', user, page, total, posts);
        res.render('user', {
          title: user.name,
          posts: posts,
          page: page,
          isFirstPage: (page - 1) === 0,
          isLastPage: ((page - 1)*10 + posts.length) === total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    });
  });


  // 搜索页面
  app.get('/search', function(req, res){
    Post.search(req.query.keyword, function(err, posts){
      if(err){
        req.flash('err', err);
        return res.redirect('/');
      }

      res.render('search', {
        title: '搜索：' + req.query.keyworkd,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });


  // 友情链接页面
  app.get('/links', function(req, res){
    res.render('links', {
      title: '友情链接',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });


  // 文章页面
  app.get('/post/:_id', function(req, res){
    Post.getOne(req.params._id, function(err, post){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      console.log(post);
      res.render('article', {
        title: post.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/post/:_id', function(req, res){ // 评论接口
    var date = new Date()
      , time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      , md5 = crypto.createHash('md5')
      , email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex')
      , headface = 'http://www.gravatar.com/avatar/' + email_MD5 +'?s=48'
      , content = req.body.content;

    if(!content) res.redirect('back');
    var comment = {
        contentid: req.params._id,
        parentid: req.body.parentid || 0,
        name: req.body.name,
        headface: headface,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
      }

    var newComment = new Comment(req.params._id, comment);

    newComment.save(function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      req.flash('success', '留言成功！');
      res.redirect('back');
    });
  });


  // 存档页面
  app.get('/archive', function(req, res){
    Post.getArchive(function(err, posts){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      res.render('archive', {
        title: '存档',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });


  // 标签页面
  app.get('/tags', function(req, res){
    Post.getTags(function(err, posts){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      res.render('tags', {
        title: '标签',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags/:tag', function(req, res){
    Post.getTag(req.params.tag, function(err, posts){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      res.render('tag', {
        title: '标签：' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });


  // 删除接口
  app.get('/remove/:_id', checkLogin);
  app.get('/remove/:_id', function(req, res){
    var currentUser = req.session.user;

    Post.remove(req.params._id, function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      req.flash('success', '删除成功！');
      res.redirect('/');
    });
  });


  // 评论接口
  app.post('/comment/addcmt', function(req, res){
    var date = new Date()
      , time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      , md5 = crypto.createHash('md5')
      , email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex')
      , headface = 'http://www.gravatar.com/avatar/' + email_MD5 +'?s=48'
      , content = req.body.content;

    if(!content) res.redirect('back');
    var comment = {
        contentid: req.body.contentid,
        parentid: req.body.parentid || 0,
        name: req.body.name,
        headface: headface,
        email: req.body.email,
        website: req.body.website,
        time: time,
        upvote: 0,
        content: req.body.content
      }

    var newComment = new Comment(req.params._id, comment);

    newComment.save(function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      // req.flash('success', '留言成功！');
      res.redirect('back');
    });
  });

  app.post('/comment/delcmt', checkLogin);
  app.post('/comment/delcmt', function(req, res){
    Comment.remove(req.body._id, function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      req.flash('success', '删除成功！');
      res.redirect('/');
    });
  });

  // app.post('/comment/upcmt', checkLogin);
  app.post('/comment/upcmt', function(req, res){
    Comment.upvote(req.body._id, function(err, votes){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }

      req.flash('success', '赞成功！');
      res.send(1, { upvote: votes });
    });
  });


  // 上传页面
  app.get('/upload', checkLogin);
  app.get('/upload', function (req,res){
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/upload', checkLogin);
  app.post('/upload', function (req, res){
    for(var i in req.files){
      if(req.files[i].size === 0){
        // 使用同步方式删除一个文件
        fs.unlinkSync(req.files[i].path);
        console.log('Successfully removed an empty file !');
      }
      else{
        var target_path = './path/upload/' + req.files[i].name;
        console.log(req.files[i].path, req.files[i].name);

        // 使用同步方式重命名一个文件
        fs.renameSync(req.files[i].path, target_path);
        console.log('Successfully renamed a file !');
      }
    }

    req.flash('success', '文件上传成功！');
    res.redirect('/upload');
  });


  // 注册页面
  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name
      , password = req.body.password
      , password2 = req.body.password2;

    if(password !== password2){
      req.flash('error', '两次输入的密码不一致！');
      console.log('error', '两次输入的密码不一致！', password, password2);
      return res.redirect('/reg');
    }

    var md5 = crypto.createHash('md5')
      , password = md5.update(req.body.password).digest('hex');

    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
      });

    User.get(newUser.name, function(err, user){
      if(user){
        req.flash('error', '用户已存在！');
        // console.log('error', '用户已存在！', user);
        return res.redirect('/reg');
      }

      newUser.save(function(err, user){
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        // console.log('success', '注册成功!', user);
        res.redirect('/');
      });
    });

  });


  // 登录页面
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5')
      , password = md5.update(req.body.password).digest('hex');

    //检查用户是否存在
    User.get(req.body.name, function(err, user){
      if(!user){
        req.flash('error', '用户不存在!');
        console.log('error', '用户不存在!', err);
        return res.redirect('/login'); // 用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        console.log('error', '密码错误!', password);
        return res.redirect('/login'); // 密码错误则跳转到登录页
      }
      // 用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      console.log('success', '登陆成功!');
      res.redirect('/'); // 登陆成功后跳转到主页
    });

  });


  // 登出页面
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res){
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/'); // 登出成功后跳转到主页
  });


  // 404 页面
  app.use(function(req, res){
    res.render('404');
  });


  function checkLogin(req, res, next){
    if(!req.session.user){
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next){
    if(req.session.user){
      req.flash('error', '已登录!'); 
      res.redirect('back'); // 返回之前的页面
    }
    next();
  }

}