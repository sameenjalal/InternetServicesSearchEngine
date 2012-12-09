var mongoose = require("mongoose")
  , schema = require("../models/schemas")
  , word_to_tf_idf = schema.tf_idf
  , word_to_url_ids = schema.word_to_url_ids
  , url_ids_to_url = schema.UrlIdsToUrl;

exports.show = function(req, res) {
  res.render('search', {
    title: "Search",
    results: []
  });
}

exports.add = function(req, res) {
  query = req.body.add_element;
	queries = query.split(" ");
  a = word_to_tf_idf.findOne({"word": "not"})
	console.log(a)

  console.log(query);
  res.contentType("json");
  res.send({item: query});
}
