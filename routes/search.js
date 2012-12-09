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
	query_to_locations_map = get_query_to_locations_map(queries, function() {
		this(query_to_locations_map);
	});
	console.log(query_to_locations_map); // Why doesnt this store anything

	/*
	intersect_locations = get_intersecting_locations(query_to_locations_map);

	rest_of_locations = get_straggling_locations(query_to_locations_map, intersect_locations);

	ranked_intersected_locations = rank_locations(intersect_locations);
	ranked_stragger_locations = rank_locations(rest_of_locations);

	combined_url_id_response = ranked_intersected_locations.concat(ranked_stragger_locations);
	list_of_urls = get_url_names_for_url_ids(combined_url_id_response);
	*/

	res.contentType("json");
	res.send({item: query});
}

function get_intersecting_locations(query_to_locations_map) {
	max_word = "";
	max_appearance_links = 0;
	for (word in query_to_locations_map) {
		if (query_to_locations_map[word] && query_to_locations_map[word].length >= max_appearance_links) {
			max_word = word;
			max_appearance_links = query_to_locations_map[word].length;
		}
	}

	if (max_word != "") {
		return [];
	}
	intersect_list = query_to_locations_map[max_word];
	for (word in query_to_locations_map) {
		if (word === max_word) {
			continue;
		}

		intersect_list = intersection(intersect_list.sort(), query_to_locations_map[word].sort());
	}
	return intersect_list;
}

function intersection(a, b) {
	var ai = 0
		, bi = 0
		, result = new Array();
	while (ai < a.length && bi < b.length) {
		if (a[ai] < b[bi]) {
			ai++;
		} else if (a[ai] > b[bi]) {
			bi++;
		} else {
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}
	return result;
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
	var query_to_locations_map = {};
	num_queries = Math.min(queries.length, 15);
	num_queries_completed = 0;

	var mongoose_callback = function(err, element) {
		if (!err && element !== null && element[0] && element[0].urls && element[0].urls[0]) {
			qry = queries[num_queries_completed];
			query_to_locations_map[qry] = parse_string_into_list(element[0].urls[0]);
		}

		num_queries_completed++;
		if (num_queries_completed == num_queries) {
			// This returns a map, it works
			return query_to_locations_map;
		}
	};

	for (var i = 0; i < num_queries; i++) {
		q = queries[i];
		word_to_url_ids.find({"word": q}, mongoose_callback);
	}
}

function parse_string_into_list(str_list) {
	str_list = str_list.replace(/\,/g, "");
	str_list = str_list.replace(/\[/g, "");
	str_list = str_list.replace(/\]/g, "");

	return str_list.split(" ");
}
