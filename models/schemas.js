var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TfIdfSchema = new Schema({
  'word': String,
  'tf_idf': Number
});

var WordToUrlIdsSchema = new Schema({
  "word": String,
  "urls": [String]
});

var UrlIdsToUrlSchema = new Schema({
  "id": Number,
  "url": String
});

module.exports = {
  tf_idf: mongoose.model('word_to_tf_idf', TfIdfSchema)
  , word_to_url_ids: mongoose.model('word_to_urls', WordToUrlIdsSchema)
  , url_ids_to_url: mongoose.model('url_ids_to_url', UrlIdsToUrlSchema)
};
