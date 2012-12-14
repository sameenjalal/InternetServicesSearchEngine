#!/usr/bin/env python

import os
import fileinput
import time
import re
import math
import pymongo

file = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/parse_output/output"
mongohq_url = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

conn = pymongo.Connection("linus.mongohq.com", 10002)
db = conn["InternetServices"]
db.authenticate("samjalal", "robin")

def create_word_to_tf_idf(url_id_to_max_word_count, word_to_num_appearances, max_urls):
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.error == 1:
			continue
		num_appearances = word_to_num_appearances[line.word]
		max_word_count = url_id_to_max_word_count[line.url_id]

		tf_idf = calculate_tf_idf(max_urls, num_appearances, line.freq, max_word_count)
		insert_into_mongohq(tf_idf, line.url_id, line.word)

def create_url_id_to_max_word_count_map():
	url_id_to_max_word_count = dict()
	# calculate max word count in each doc
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.error == 1:
			continue
		if line.url_id in url_id_to_max_word_count:
			url_id_to_max_word_count[line.url_id] = max(url_id_to_max_word_count[line.url_id], line.freq)
		else:
			url_id_to_max_word_count[line.url_id] = line.freq
	return url_id_to_max_word_count

def create_word_to_num_appearances():
	word_to_num_appearances = dict()
	for line_data in fileinput.input(file):
		line = Line(line_data)
		if line.error == 1:
			continue
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
		split_line = re.split('\s+', line)
		if len(split_line[2]) != 0:
			self.error = 0
			self.url_id = int(split_line[0])
			self.word = split_line[1]
			self.freq = int(split_line[2])
		else:
			self.error = 1

def insert_into_mongohq(tf_idf, url_id, word):
	db.word_to_tf_idf.insert({"word": word, "tf_idf": tf_idf, "url_id": url_id})

def main():
	url_id_to_max_word_count = create_url_id_to_max_word_count_map() # works
	max_urls = len(url_id_to_max_word_count) # works

	word_to_num_appearances = create_word_to_num_appearances()
	create_word_to_tf_idf(url_id_to_max_word_count, word_to_num_appearances, max_urls)

if __name__ == "__main__":
	main()
