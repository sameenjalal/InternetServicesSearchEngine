var mongoose = require("mongoose")
	, schemas = require("../models/schemas")
	, word_to_tf_idf = schemas.tf_idf
	, word_to_url_ids = schemas.word_to_url_ids
	, url_ids_to_url = schemas.url_ids_to_url
	, db = require("../app").db;

exports.show = function(req, res) {
	res.render('search', {
		title: "Search",
		results: []
	});
}

exports.add = function(req, res) {
	query = req.body.add_element;
	query = query.toLowerCase();
	queries = query.split(" ");
	get_query_to_locations_map(queries, function(query_to_locations_map) {
		intersect_locations = get_intersecting_locations(query_to_locations_map);
		rest_of_locations = get_straggling_locations(query_to_locations_map, intersect_locations);

		ranked_intersected_locations = rank_locations(intersect_locations);
		ranked_stragger_locations = rank_locations(rest_of_locations);

		combined_url_id_response = ranked_intersected_locations.concat(ranked_stragger_locations);
		get_url_names_for_url_ids(combined_url_id_response, function(list_of_urls) {
			res.contentType("json");
			res.send({urls: list_of_urls});
		});
	});
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

	if (!max_word || max_word.length === 0) {
		//console.log("Returned empty intersection with: " + max_word);
		return [];
	}
	intersect_list = query_to_locations_map[max_word];
	for (word in query_to_locations_map) {
		if (word === max_word) {
			continue;
		}

		intersect_list = list_intersection(intersect_list.sort(), query_to_locations_map[word].sort());
		console.log("intersect list: " + intersect_list);
	}
	return get_tf_idf_sorted_words_with_list(intersect_list);
}

function list_intersection(a, b) {
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
	if (intersecting_locations_list.length === 0) {
		return [];
	}

	word_list = get_tf_idf_sorted_words_with_map(query_to_locations_map);
	giant_location_list = [];
	for (word_index in word_list) {
		word = word_list[word_index];
		list = query_to_locations_map[word];
		for (i in list) {
			giant_location_list.push(list[i]);
		}
	}

	unique_trimmed_location_list = unique_trimmed_list(giant_location_list, intersecting_locations_list);
	return unique_trimmed_location_list;
}

function get_tf_idf_sorted_words_with_map(query_to_locations_map) {
	// TODO: Finish the functionality of this function using mongo

	word_list = [];
	for (word in query_to_locations_map) {
		word_list.push(word);
	}
	return word_list;
}

function get_tf_idf_sorted_words_with_list(query_to_locations_list) {
	// TODO: Finish the functionality of this function using mongo

	word_list = [];
	for (index in query_to_locations_list) {
		word_list.push(query_to_locations_list[index]);
	}
	return word_list;
}

function unique_trimmed_list(list, r_list) {
	var o = {}
		, u = {}
		, i
		, lo = list.length
		, lu = list.length
		, r = [];

		for (i = 0; i < lo; i += 1) {
			o[list[i]] = list[i];
		}

		for (i = 0; i < lu; i += 1) {
			u[r_list[i]] = r_list[i];
		}

		for (i in o) {
			if (!u[i]) {
				r.push(o[i]);
			}
		}
		return r;
};

function rank_locations(locations_list) {
	// TODO: Finish functionallity for location ranking with webgraph data
	return locations_list;
}

function get_url_names_for_url_ids(url_id_list, cb_function) {
	url_name_list = [];
	num_urls = url_id_list.length;
	num_urls_processed = 0;
	
	if (num_urls == 0) {
		cb_function([]);
		return;
	}

	var url_ids_to_url_mongoose_cb = function(err, element) {
		if (!err && element !== null) {
			url = element[0].url;
			url_name_list.push(url);
		} else {
			console.log("Error in getting url names from db");
		}

		num_urls_processed++;
		if (num_urls_processed == num_urls) {
			cb_function(url_name_list);
		}
	};

	for (index in url_id_list) {
		url_id = url_id_list[index];
		url_ids_to_url.find({"url_num": url_id}, url_ids_to_url_mongoose_cb);
	}
}

function get_query_to_locations_map(queries, cb_function) {
	var query_to_locations_map = {};
	num_queries = Math.min(queries.length, 15);
	num_queries_completed = 0;

	var mongoose_callback = function(err, element) {
		if (!err && element !== null && element[0] && element[0].urls && element[0].urls[0]) {
			word_from_db = element[0].word;
			list_of_urls = element[1].urls[0];
			query_to_locations_map[word_from_db] = parse_string_into_list(list_of_urls);
		}

		num_queries_completed++;
		if (num_queries_completed == num_queries) {
			cb_function(query_to_locations_map);
		}
	};

	for (var i = 0; i < num_queries; i++) {
		q = queries[i];
		console.log(q);
		word_to_url_ids.find({"word": q}, mongoose_callback);
	}
}

function parse_string_into_list(str_list) {
	str_list = str_list.replace(/\,/g, "");
	str_list = str_list.replace(/\[/g, "");
	str_list = str_list.replace(/\]/g, "");

	return str_list.split(" ");
}
