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
	query_to_locations_map = get_query_to_locations_map(queries);

	intersect_locations = get_intersecting_locations(query_to_locations_map);
	rest_of_locations = get_straggling_locations(query_to_locations_map, intersect_locations);

	ranked_intersected_locations = rank_locations(intersect_locations);
	ranked_stragger_locations = rank_locations(rest_of_locations);

	combined_url_id_response = ranked_intersected_locations.concat(ranked_stragger_locations);
	list_of_urls = get_url_names_for_url_ids(combined_url_id_response);

	res.contentType("json");
	res.send({item: query});
}

function get_intersecting_locations(query_to_locations_map) {
	for (word in query_to_locations_map) {
	}
	return [];
}

function get_straggling_locations(query_to_locations_map, intersecting_locations_list) {
	return [];
}

function rank_locations(locations_list) {
	return [];
}

function get_url_names_for_url_ids(url_id_list) {
	return [];
}

function get_query_to_locations_map(queries) {
	query_to_locations_map = {}
	for (var i = 0; i < Math.min(queries.length, 15); i++) {
		q = queries[i];

		word_to_url_ids.find({"word": q}, function(err, element) {
			if (!err && element !== null && element[0] && element[0].urls && element[0].urls[0]) {
				query_to_locations_map[q] = parse_string_into_list(element[0].urls[0]);
			}
		});
	}
	// This isnt returning properly... probably cause of some async thing
	console.log(query_to_locations_map);
	return query_to_locations_map;
}

function parse_string_into_list(str_list) {
	str_list = str_list.replace(/\,/g, "");
	str_list = str_list.replace(/\[/g, "");
	str_list = str_list.replace(/\]/g, "");

	return str_list.split(" ");
}
