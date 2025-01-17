#!/usr/bin/env python

import os
import fileinput
import time
import re
import pymongo

path = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/url_store/"
prefix_to_part_files = "url_id"
mongohq_url = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

def run(file):
	url_map = create_url_map(file)
	return url_map

def create_url_map(file):
	url_map = dict()

	for line_data in fileinput.input(file):
		line_data = line_data.strip()
		if len(line_data) == 0:
			continue

		line = Line(line_data)
		url_map[line.id] = line.url

	return url_map

class Line():
	def __init__(self, line):
		line = line.strip()
		# split up line
		split_line = re.split('\s+', line)
		self.id = str(split_line[1])
		self.url = str(split_line[3])

def combine_dictionaries(main_dict, to_merge_dict):
	for key, value in to_merge_dict.iteritems():
		if key in main_dict:
			pass
		else:
			main_dict[key] = to_merge_dict[key]
	return main_dict

def insert_into_mongohq(db, key, val):
	db.url_ids_to_url.insert({"url_num": key, "url": str(val)})

def main():
	conn = pymongo.Connection("linus.mongohq.com", 10002)
	db = conn["InternetServices"]
	db.authenticate("samjalal", "robin")

	convert_url_ids_to_url = dict()
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			covert_url_ids_to_url = combine_dictionaries(convert_url_ids_to_url, run(path + file))

	for key, value in sorted(convert_url_ids_to_url.iteritems(), key = lambda (k, v): (k, v)):
		insert_into_mongohq(db, key, value)

if __name__ == "__main__":
	main()
