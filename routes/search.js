exports.show = function(req, res) {
  res.render('search', {
    title: "Search",
    results: []
  });
}

exports.add = function(req, res) {
  query = req.body.add_element;
  console.log(query);
  res.contentType("json");
  res.send({item: query});
}
