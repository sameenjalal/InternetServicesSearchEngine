#!/usr/bin/env python

import os
import fileinput
import time
import re
import math

#path = "path/to/file"
path = "/ilab/users/samjalal/InternetServicesIndexer"
prefix_to_part_files = "output"

def run(file):
	url_id_to_max_word_count = create_url_id_to_max_word_count_map(file) # works
	max_urls = len(url_id_to_max_word_count) # works

	word_to_num_appearances = create_word_to_num_appearances(file)
	i = int(0)
	j = int(0)
	b = int(0)
	c = int(0)
	d = int(0)
	e = int(0)
	for k, v in word_to_num_appearances.items():
		i += 1
		if v > 1: j += 1
		if v > 2: b += 1
		if v > 3: c += 1
		if v > 4: d += 1
		if v > 5: e += 1

	print "All unique words: " + str(i)
	print "All words appearing more than once: " + str(j)
	print "All words appearing more than twice: " + str(b)
	print "All words appearing more than 3 times: " + str(c)
	print "All words appearing more than 4 times: " + str(d)
	print "All words appearing more than 5 times: " + str(e)

	word_to_tf_idf = create_word_to_tf_idf(file, url_id_to_max_word_count, word_to_num_appearances, max_urls)

	a = int(0)
	b = int(0)
	c = int(0)
	d = int(0)
	e = int(0)
	f = int(0)
	g = int(0)
	w = int(0)
	for key, value in word_to_tf_idf.items():
		a += 1
		if value > 0:
			b += 1
			if value < 1:
				w += 1
		if value > 1: c += 1
		if value > 2: d += 1
		if value > 3: e += 1
		if value > 4: f += 1
		if value > 5: g += 1
	print
	print "Num tf idfs: " + str(a)
	print "Num tf idfs > 0: " + str(b)
	print "Num tf idfs > 1: " + str(c)
	print "Num tf idfs > 2: " + str(d)
	print "Num tf idfs > 3: " + str(e)
	print "Num tf idfs > 4: " + str(f)
	print "Num tf idfs > 5: " + str(g)
	print "Num tf idfs > 0 and < 1: " + str(w)

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

def main():
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			run(file)

if __name__ == "__main__":
	main()
