var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TfIdfSchema = new Schema({
  'word': String,
  'tf_idf_value': Number
});

var WordToUrlIdsSchema = new Schema({
  "word": String,
  "urls": [String]
});

var UrlIdsToUrlSchema = new Schema({
  "id": Number,
  "url": String
});

module.exports = mongoose.model('TfIdf', TfIdfSchema);
module.exports = mongoose.model('WordToUrlIds', WordToUrlIdsSchema);
module.exports = mongoose.model('UrlIdsToUrl', UrlIdsToUrlSchema);
