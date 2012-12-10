#!/usr/bin/env python

import os
import fileinput
import time
import re

#path = "path/to/file"
path = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/url_store/"
prefix_to_part_files = "url_id"

def create_url_map(file):
	url_map = dict()
	# calculate max id count in each doc
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.url in url_map:
			url_map[line.url].append(line.id)
		else:
			url_map[line.url] = line.id
	return url_map

def create_max_id_count(file):
	max_val=0
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.id > max_val:
			max_val=line.id
	return max_val



class Line():
	def __init__(self, line):
		# split up line
		split_line = re.split('\s+', line)
		self.id = str(split_line[1])
		self.url = str(split_line[3])

def main():
	count=0
	max_val=0
	url_map = dict()
	combined_word_to_urls = dict()
	for file in os.listdir(path):
		count = count + 1
		if count = 1
			max_val=create_max_id_count("/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/url_store/url_id_edu/")
		else if count = 2
			url_map=create_url_map("/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/url_store/url_id_sports/")
		else
			break
	line.id = max_val + 1

if __name__ == "__main__":
	main()
