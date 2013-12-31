var mongodb = require('./db')
  , ObjectID = require('mongodb').ObjectID;

function Comment(_id, comment){
  // this.name = name;
  // this.day = day;
  // this.title = title;
  this._id = new ObjectID(_id);
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback){
  var _id = this._id
    , comment = this.comment;

  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      console.log(_id);
      collection.update({
        "_id": new ObjectID(_id)
      }, {
        $push: {"comments": comment}
      }, function(err){
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });
    });
  });
}