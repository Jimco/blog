var mongodb = require('./db')
  , ObjectID = require('mongodb').ObjectID;

function Comment(_id, comment){
  // this.name = name;
  // this.day = day;
  // this.title = title;
  this._id = _id;
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback){
  var _id = this._id
    , comment = this.comment;

  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('comments', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // console.log(_id);
      // collection.update({
      //   "_id": new ObjectID(_id)
      // }, {
      //   $push: {"comments": comment}
      // }, function(err){
      //   mongodb.close();
      //   if(err) return callback(err);
      //   callback(null);
      // });
      collection.insert(comment, {
        safe: true
      }, function(err, comment){
        mongodb.close();
        if(err) return callback(err);
        callback(null, comment[0]);
      });

    });
  });
}

Comment.remove = function(_id, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('comments', function(err, collection){
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
}

Comment.upvote = function(_id, callback){
  var _id = new ObjectID(_id);

  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('comments', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.update({
        "_id": _id
      }, {
        $inc: { "upvote": 1 }
      }, function(err){
        if(err) return callback(err);

        collection.findOne({
          "_id": _id
        }, function(err, item){
          mongodb.close();
          if(err) callback(err);
          callback(err, item.upvote);
        });
        
      });
    });
  });
}