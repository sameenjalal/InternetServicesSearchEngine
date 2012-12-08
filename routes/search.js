exports.show = function(req, res) {
  res.render('search', {
    title: "Search",
    results: []
  });
}

exports.add = function(req, res) {
  res.contentType("json");
  res.send({item: req.body.add_element});
}
