var mongoose = require("mongoose")
	, schemas = require("../models/schemas")
	, word_to_tf_idf = schemas.tf_idf
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
		get_all_sorted_locations(query_to_locations_map, intersect_locations, function(combined_locations) {
			get_url_names_for_url_ids(combined_locations, function(url_obj) {
				res.contentType("json");
				res.send({urls: url_obj});
			});
		});
	});
}

function get_intersecting_locations(query_to_locations_map) {
	if (query_to_locations_map.length == 0) {
		return [];
	}

	intersect_list = [];
	int_index = 0;

	map_keys = Object.keys(query_to_locations_map);
	org_list = query_to_locations_map[map_keys[0]];
	for (j = 1; j < map_keys.length; j++) {
		list = query_to_locations_map[map_keys[j]];
		for (i = 1; i < list.length; i++) {
			if (org_list.indexOf(list[i]) != -1) {
				intersect_list[int_index++] = list[i];
			}
		}
	}
	return intersect_list;
}

function get_all_sorted_locations(query_to_locations_map, intersecting_locations_list, cb_function) {
	if (Object.keys(query_to_locations_map).length == 0) {
		cb_function([]);
		return;
	}

	map_keys = Object.keys(query_to_locations_map);
	query_list = [];
	for (index in map_keys) {
		query_list.push({"word": map_keys[index]});
	}

	query_cb = function(err, elem) {
		if (!err && elem && elem.length > 0) {
			sorted_strag_url_list = [];
			sorted_inter_url_list = [];
			url_s = 0;
			url_i = 0;

			for (x in elem) {
				if (intersecting_locations_list.indexOf(elem[x]) == -1) {
					sorted_strag_url_list[url_s++] = elem[x].url_id;
				} else {
					sorted_inter_url_list[url_i++] = elem[x].url_id;
				}
			}
			
			combined_locations = sorted_inter_url_list.concat(sorted_strag_url_list);
			cb_function(combined_locations);
		}
	};

	word_to_tf_idf
		.find({"$or": query_list})
		.sort({"tf_idf": -1})
		.execFind(query_cb);
}

function get_url_names_for_url_ids(url_id_list, cb_function) {
	url_obj = {};
	num_urls = url_id_list.length;
	num_urls_processed = 0;
	
	if (num_urls == 0) {
		cb_function([]);
		return;
	}

	url_name_cb = function(err, element) {
		if (!err && element && element.length > 0) {
			index = url_id_list.indexOf(element[0].url_id);
			url_obj[index] = {"link": element[0].url, "title": element[0].title}
		}

		num_urls_processed++;
		if (num_urls_processed == num_urls) {
			cb_function(url_obj);
		}
	};

	for (index in url_id_list) {
		url_id = url_id_list[index];
		url_ids_to_url.find({"url_id": url_id}, url_name_cb);
	}
}

function get_query_to_locations_map(queries, ret_cb_function) {
	query_to_locations_map = {};
	num_queries = Math.min(queries.length, 15);
	num_queries_completed = 0;

	query_cb_function = function(err, element) {
		if (!err && element && element.length > 0) {
			word_from_db = element[0].word;
			list_of_urls = [];
			i = 0;
			for (index in element) {
				list_of_urls[i] = element[index].url_id;
				i++;
			}
			query_to_locations_map[word_from_db] = list_of_urls;
		}

		num_queries_completed++;
		if (num_queries_completed == num_queries) {
			ret_cb_function(query_to_locations_map);
		}
	};

	for (i = 0; i < num_queries; i++) {
		q = queries[i];
		word_to_tf_idf
			.find({"word": q})
			.sort({'tf_idf': -1})
			.execFind(query_cb_function);
	}
}
