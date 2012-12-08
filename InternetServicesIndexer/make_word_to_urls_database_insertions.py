#!/usr/bin/env python

import os
import fileinput
import time
import re

#path = "path/to/file"
path = "/ilab/users/samjalal/InternetServicesIndexer/parse_output/"
prefix_to_part_files = "parse"

def run(file):
	url_map = create_url_map(file)
	return url_map

def create_url_map(file):
	url_map = dict()
	# calculate max word count in each doc
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.word in url_map:
			url_map[line.word].append(line.url_id)
		else:
			url_map[line.word] = [line.url_id]
	return url_map

class Line():
	def __init__(self, line):
		# split up line
		split_line = re.split('\s+', line)
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

def main():
	combined_word_to_urls = dict()
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			combined_word_to_urls = combine_dictionaries(combined_word_to_urls, run(path + file))

	for key, value in sorted(combined_word_to_urls.iteritems(), key=lambda (k,v): (k,v)):
		print str(key) + " " + str(value)

if __name__ == "__main__":
	main()
