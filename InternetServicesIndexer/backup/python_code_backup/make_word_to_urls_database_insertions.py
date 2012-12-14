#!/usr/bin/env python

import os
import fileinput
import time
import re
import pymongo

#path = "path/to/file"
path = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/parse_output/"
prefix_to_part_files = "parse"
mongohq_url = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

def run(file):
	url_map = create_url_map(file)
	return url_map

def create_url_map(file):
	url_map = dict()
	# calculate max word count in each doc
	for line_data in fileinput.input(file):
		line_data = line_data.strip();
		line = Line(line_data)
		if line.dne == 0:
			continue
		if line.word in url_map:
			url_map[line.word].append(line.url_id)
		else:
			url_map[line.word] = [line.url_id]
	return url_map

class Line():
	def __init__(self, line):
		# split up line
		split_line = re.split('\s+', line)
		if len(split_line) < 5:
			self.dne = 0
		else:
			self.dne = 1
			self.url_id = int(split_line[1])
			self.word = split_line[3]
			self.freq = int(split_line[4])

def combine_dictionaries(main_dict, to_merge_dict):
	for key, value in to_merge_dict.iteritems():
		if key in main_dict:
			main_dict[key] = main_dict[key] + to_merge_dict[key]
		else:
			main_dict[key] = to_merge_dict[key]
	return main_dict

def insert_into_mongohq(db, key, val):
  db.word_to_urls.insert({"word": str(key), "urls": str(val)})

def main():
	conn = pymongo.Connection("linus.mongohq.com", 10002)
	db = conn["InternetServices"]
	db.authenticate("samjalal", "robin")

	combined_word_to_urls = dict()
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			combined_word_to_urls = combine_dictionaries(combined_word_to_urls, run(path + file))

	for key, value in sorted(combined_word_to_urls.iteritems(), key=lambda (k,v): (k,v)):
		insert_into_mongohq(db, key, value)

if __name__ == "__main__":
	main()
