var mongodb = require('./db')
  , markdown = require('markdown').markdown
  , ObjectID = require('mongodb').ObjectID
  , async = require('async');

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
    , zeroComplet = function(s){ return s < 10 ? '0' + s : s; }
    , days = zeroComplet(date.getDate())
    , year = date.getFullYear()
    , month = zeroComplet(date.getMonth()+1)
    , day = date.getDate()
    , hour = zeroComplet(date.getHours())
    , minute = zeroComplet(date.getMinutes())
    , time = {
      date: date,
      year: year,
      month: year + '-' + month,
      day: year + '-' + month + '-' + day,
      minute: year + '-' + month + "-" + day + ' ' + hour + ':' + minute 
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
  // mongodb.open(function(err, db){
  //   if(err) return callback(err);

  //   // 读取 posts 集合
  //   db.collection('posts', function(err, collection){
  //     if(err){
  //       mongodb.close();
  //       return callback(err);
  //     }

  //     // 将文档插入 posts 集合
  //     collection.insert(post, {
  //       safe: true
  //     }, function(err){
  //       mongodb.close();
  //       if(err) return callback(err);
  //       callback(null);
  //     });
  //   });
  // });

  async.waterfall([
    function(cb){
      mongodb.open(function(err, db){
        cb(err, db);
      });
    },
    function(db, cb){
      db.collection('posts', function(err, collection){
        cb(err, collection);
      });
    },
    function(collection, cb){
      collection.insert(post, {
        safe: true
      }, function(err){
        cb(err);
      });
    }
  ], function(err){
    mongodb.close();
    callback(err);
  });

};

// 读取所有文章
Post.getAll = function(name, callback){
  // mongodb.open(function(err, db){
  //   if(err) return callback(err);

  //   // 读取 posts 集合
  //   db.collection('posts', function(err, collection){
  //     if(err){
  //       mongodb.close();
  //       return callback(err);
  //     }

  //     var query = {};

  //     if(name) query.name = name;

  //     // 根据 query 对象查询文章
  //     collection.find(query).sort({ time: -1 }).toArray(function(err, docs){
  //       mongodb.close();
  //       if(err) return callback(err);

  //       console.log(docs);
  //       docs.forEach(function(doc){
  //         doc.post = markdown.toHTML(doc.post);
  //       });
        
  //       callback(null, docs);
  //     });
  //   });
  // });

  async.waterfall([
    function(cb){
      mongodb.open(function(err, db){
        cb(err, db);
      });
    },
    function(db, cb){
      db.collection('posts', function(err, collection){
        cb(err, collection);
      });
    },
    function(collection, cb){
      collection.find(query).sort({ time: -1 }).toArray(function(err, docs){
        cb(err, docs);
      });
    }
  ], function(err, docs){
    mongodb.close();
    if(err) callback(err);
    docs.forEach(function(doc){
      doc.post = markdown.toHTML(doc.post);
    });
    
    callback(null, docs);
  });

};

// 读取1篇文章
Post.getOne = function(_id, callback){
  // mongodb.open(function(err, db){
  //   if(err) return callback(err);

  //   db.collection('posts', function(err, collection){
  //     if(err){
  //       mongodb.close();
  //       return callback(err);
  //     }

  //     collection.findOne({
  //       "_id": new ObjectID(_id)
  //     }, function(err, doc){
  //       if(err){
  //         mongodb.close();
  //         return callback(err);
  //       }
  //       if(doc){
  //         // pv+1
  //         collection.update({
  //           "_id": new ObjectID(_id)
  //         }, {
  //           $inc: {"pv": 1}
  //         }, function(err){
  //           mongodb.close();
  //           if(err) return callback(err);
  //         });

  //         doc.post = markdown.toHTML(doc.post);
  //         doc.comments.forEach(function(comment){
  //           comment.content = markdown.toHTML(comment.content);
  //         });
  //       }
  //       callback(null, doc);
  //     });
  //   });
  // });

  async.waterfall([
    function(cb){
      mongodb.open(function(err, db){
        cb(err, db);
      });
    },
    function(db, cb){
      db.collection('posts', function(err, collection){
        collection.findOne({
          "_id": new ObjectID(_id)
        }, function(err, doc){
          cb(err, db, collection, doc);
        });
      });
    },
    function(db, postColl, postDoc, cb){
      db.collection('comments', function(err, cmtColl){
        cmtColl.find({
          "contentid": _id
        })
        .sort({ time: -1 })
        .toArray(function(err, docs){
          postDoc.comments = docs;
          cb(err, postColl, postDoc);
        });
      });
    },
    function(collection, doc, cb){
      if(doc){
        // pv+1
        collection.update({
          "_id": new ObjectID(_id)
        }, {
          $inc: { "pv": 1 }
        }, function(err){
          cb(err, doc)
        });
      }        
    }
  ], function(err, doc){
    mongodb.close();
    if(err) return callback(err);

    doc.post = markdown.toHTML(doc.post);
    doc.comments.forEach(function(comment){
      comment.content = markdown.toHTML(comment.content);
    });
    callback(null, doc);
  });

};

// 读取10篇文章
Post.getTen = function(name, page, callback){
  // mongodb.open(function(err, db){
  //   if(err) return callback(err);

  //   db.collection('posts', function(err, collection){
  //     if(err){
  //       mongodb.close();
  //       return callback(err);
  //     }

  //     var query = {};
  //     if(name) query.name = name;

  //     collection.count(query, function(err, total){
  //       // 根据 query 对象查询，并跳过前 (page - 1)*
  //       collection.find(query, {
  //         skip: (page - 1)*10,
  //         limit: 10
  //       }).sort({
  //         time: -1
  //       }).toArray(function(err, docs){
  //         mongodb.close();
  //         if(err) return callback(err);
  //         docs.forEach(function(doc){
  //           doc.post = markdown.toHTML(doc.post).substr(0, 160) + ' ...';
  //         });

  //         callback(null, docs, total);
  //       });
  //     });
  //   });
  // });
  var query = {};
  if(name) query.name = name;

  async.waterfall([
    function(cb){
      mongodb.open(function(err, db){
        cb(err, db);
      });
    },
    function(db, cb){
      db.collection('posts', function(err, collection){
        cb(err, collection);
      });
    },
    function(collection, cb){
      collection.count(query, function(err, total){
        cb(err, collection, total);
      });
    },
    function(collection, total, cb){
      collection.find(query, {
        skip: (page - 1)*10,
        limit: 10
      }).sort({
        time: -1
      }).toArray(function(err, docs){
        cb(err, docs, total);
      })
    }
  ], function(err, docs, total){
    mongodb.close();
    if(err) return callback(err);
    docs.forEach(function(doc){
      doc.post = markdown.toHTML(doc.post).substr(0, 160) + ' ...';
    });

    callback(null, docs, total);
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
Post.edit = function(_id, callback) {
  mongodb.open(function(err, db){
    if(err) return callback(err);
    
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      
      // 根据用户名、日期及文章名进行查询
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function(err, doc){
        mongodb.close();
        if(err) return callback(err);
        callback(null, doc);
      });
    });
  });
};

// 更新内容
Post.update = function(_id, title, tags, post, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);
    
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      
      collection.update({
        "_id": new ObjectID(_id)
      }, {
        $set: {
          title: title,
          tags: tags,
          post: post
        }
      }, function (err) {
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });
    });
  });
};

// 删除内容
Post.remove = function(_id, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.remove({
        "_id": new ObjectID(_id)
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

// 转载
Post.reprint = function(reprint_from, reprint_to, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // 找到被转载的文章的原文档
      collection.findOne({
        "name": reprint_from.name,
        "time.day": reprint_from.day,
        "title": reprint_from.title
      }, function(err, doc){
        if(err){
          mongodb.close();
          return callback(err);
        }

        var date = new Date()
          , time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())  
          };

        delete doc._id;
        doc.name = reprint_to.name;
        doc.headface = reprint_to.headface;
        doc.time = time;
        doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : '[转载]' + doc.title;
        doc.comments = [];
        doc.reprint_info = {"reprint_from": reprint_from};

        // 更新被转载的原文档的 reprint_info 内的 reprint_to 
        collection.update({
          "name": reprint_from.name,
          "time.day": reprint_from.day,
          "title": reprint_from.title
        }, {
          $push: {
            "reprint_info.reprint_to": {
              "name": doc.name,
              "day": time.day,
              "title": doc.title
            }
          }
        }, function(err){
          if(err){
            mongodb.close();
            return callback(err);
          }
        });

        // 将转载生成的副本修改后存入数据库，并返回存储的文档
        collection.insert(doc, {
          safe: true
        }, function(err, post){
          mongodb.close();
          if(err) return callback(err);
          callback(null, post[0]);
        });

      });
    });
  });
}
