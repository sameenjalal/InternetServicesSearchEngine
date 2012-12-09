#!/usr/bin/env python

import os
import fileinput
import time
import re
import math
import pymongo

#path = "path/to/file"
path = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/parse_output/"
prefix_to_part_files = "parse"
mongohq_url = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

def run(file):
	url_id_to_max_word_count = create_url_id_to_max_word_count_map(file) # works
	max_urls = len(url_id_to_max_word_count) # works

	word_to_num_appearances = create_word_to_num_appearances(file)
	word_to_tf_idf = create_word_to_tf_idf(file, url_id_to_max_word_count, word_to_num_appearances, max_urls)
	return word_to_tf_idf

def create_word_to_tf_idf(file, url_id_to_max_word_count, word_to_num_appearances, max_urls):
	word_to_tf_idf = dict()
	for line_data in fileinput.input(file):
		line = Line(line_data)
		num_appearances = word_to_num_appearances[line.word]
		max_word_count = url_id_to_max_word_count[line.url_id]
		if line.word in word_to_tf_idf:
			word_to_tf_idf[line.word] = calculate_tf_idf(max_urls, num_appearances, line.freq, max_word_count) + word_to_tf_idf[line.word]
		else:
			word_to_tf_idf[line.word] = calculate_tf_idf(max_urls, num_appearances, line.freq, max_word_count)
	return word_to_tf_idf

def create_url_id_to_max_word_count_map(file):
	url_id_to_max_word_count = dict()
	# calculate max word count in each doc
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.url_id in url_id_to_max_word_count:
			url_id_to_max_word_count[line.url_id] = max(url_id_to_max_word_count[line.url_id], line.freq)
		else:
			url_id_to_max_word_count[line.url_id] = line.freq
	return url_id_to_max_word_count

def create_word_to_num_appearances(file):
	word_to_num_appearances = dict()
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.word in word_to_num_appearances:
			word_to_num_appearances[line.word] += 1
		else:
			word_to_num_appearances[line.word] = 1
	return word_to_num_appearances

def calculate_tf_idf(num_urls_total, num_urls_with_word, local_frequency, max_local_frequency):
	#log(# docs) - done     			*    frequency of word in url - done
	#(1 + # docs w/ word in it) - done		 max frequency for any word in url - done
	tf = float(local_frequency) / float(max_local_frequency)
	idf = math.log(float(num_urls_total) / (1.00000 + float(num_urls_with_word)))
	return tf * idf

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

def insert_into_mongohq(db, key, val):
  db.word_to_tf_idf.insert({"word": str(key), "tf_idf": str(val)})

def main():
	conn = pymongo.Connection("linus.mongohq.com", 10002)
	db = conn["InternetServices"]
	db.authenticate("samjalal", "robin")

	combined_tf_idf = dict()
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			combined_td_idf = combine_dictionaries(combined_tf_idf, run(path + file))

	for key, value in sorted(combined_tf_idf.iteritems(), key=lambda (k,v): (k,v)):
		insert_into_mongohq(db, key, value)

if __name__ == "__main__":
	main()
