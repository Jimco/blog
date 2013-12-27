var mongodb = require('./db')
  , markdown = require('markdown').markdown;

function Post(name, headface, title, tags, post){
  this.name = name;
  this.headface = headface;
  this.title = title;
  this.tags = tags;
  this.post = post;
};

module.exports = Post;

// 存储文章及相关信息
Post.prototype.save = function(callback){
  var date = new Date()
    , time = {
      date: date,
      year: date.getFullYear(),
      month: date.getFullYear() + '-' + (date.getMonth() + 1),
      day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
      minute: date.getFullYear() + '-' + (date.getMonth() + 1) + "-" + date.getDate() + ' ' + 
      date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())  
    };

  var post = {
      name: this.name,
      headface: this.headface,
      time: time,
      title: this.title,
      tags: this.tags,
      post: this.post,
      comments: [],
      pv: 0
    };

  // 打开数据库
  mongodb.open(function(err, db){
    if(err) return callback(err);

    // 读取 posts 集合
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // 将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function(err){
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });
    });
  });
};

// 读取所有文章
Post.getAll = function(name, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    // 读取 posts 集合
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      var query = {};

      if(name) query.name = name;

      // 根据 query 对象查询文章
      collection.find(query).sort({ time: -1 }).toArray(function(err, docs){
        mongodb.close();
        if(err) return callback(err);

        console.log(docs);
        docs.forEach(function(doc){
          doc.post = markdown.toHTML(doc.post);
        });
        
        callback(null, docs);
      });
    });
  });
};

// 读取1篇文章
Post.getOne = function(name, day, title, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function(err, doc){
        if(err){
          mongodb.close();
          return callback(err);
        }
        if(doc){
          // pv+1
          collection.update({
            "name": name,
            "time.day": day,
            "title": title
          }, {
            $inc: {"pv": 1}
          }, function(err){
            mongodb.close();
            if(err) return callback(err);
          });

          doc.post = markdown.toHTML(doc.post);
          doc.comments.forEach(function(comment){
            comment.content = markdown.toHTML(comment.content);
          });
        }
        callback(null, doc);
      });
    });
  });
};

// 读取10篇文章
Post.getTen = function(name, page, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if(name) query.name = name;

      collection.count(query, function(err, total){
        // 根据 query 对象查询，并跳过前 (page - 1)*
        collection.find(query, {
          skip: (page - 1)*10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function(err, docs){
          mongodb.close();
          if(err) return callback(err);
          docs.forEach(function(doc){
            doc.post = markdown.toHTML(doc.post);
          });

          callback(null, docs, total);
        });
      });
    });
  });
}

// 读取文章存档信息
Post.getArchive = function(callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.find({}, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function(err, docs){
        mongodb.close();
        if(err) return callback(err);
        callback(null, docs);
      });
    });
  });
}

// 编辑内容
Post.edit = function(name, day, title, callback) {
  mongodb.open(function(err, db){
    if(err) return callback(err);
    
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      
      // 根据用户名、日期及文章名进行查询
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function(err, doc){
        mongodb.close();
        if(err) return callback(err);
        callback(null, doc);
      });
    });
  });
};

// 更新内容
Post.update = function(name, day, title, post, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);
    
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      
      collection.update({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        $set: {post: post}
      }, function (err) {
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });
    });
  });
};

// 删除内容
Post.remove = function(name, day, title, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.remove({
        "name": name,
        "time.day": day,
        "title": title
      }, {
        w: 1
      }, function(err){
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });
    });
  });
};

// 读取所有标签
Post.getTags = function(callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // distinct 用来找出给定键的所有不同值
      collection.distinct('tags', function(err, docs){
        mongodb.close();
        if(err) return callback(err);
        callback(null, docs);
      });
    });
  });
}

// 读取含有特定标签的所有文章
Post.getTag = function(tag, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // 查询所有 tags 数组内含有 tag 的文档
      // 并返回只含有 name、time、title 组成的数组
      collection.find({
        "tags": tag
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function(err, docs){
        mongodb.close();
        if(err) return callback(err);
        callback(null, docs);
      });
    });
  });
}

// 搜索
Post.search = function(keyword, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      var pattern = new RegExp("^.*" + keyword + ".*$", 'i');
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function(err, docs){
        mongodb.close();
        if(err) return callback(err);
        callback(null, docs);
      });
    });
  });
}
