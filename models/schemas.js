var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TfIdfSchema = new Schema({
  'word': String,
  'tf_idf': Number,
	'url_id': Number
});

var UrlIdsToUrlSchema = new Schema({
  "url_id": Number,
  "url": String,
	"title": String
});

exports.tf_idf = mongoose.model('word_to_tf_idf', TfIdfSchema, "word_to_tf_idf");
exports.url_ids_to_url = mongoose.model('url_ids_to_url', UrlIdsToUrlSchema, "url_ids_to_url");
