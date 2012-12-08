#!/usr/bin/env python

import os
import fileinput
import threading
import time
import re
import math

#path = "path/to/file"
path = "/ilab/users/samjalal"
prefix_to_part_files = "part"

class ThreadClass(threading.Thread):
	def __init__(self, file):
		threading.Thread.__init__(self)
		self.file = file

	def run(self):
		url_id_to_max_word_count = create_url_id_to_max_word_count_map(self.file)
		word_to_num_appearances = create_word_to_num_appearances(self.file)
		max_urls = len(url_id_to_max_word_count)

		word_to_tf_idf = create_word_to_tf_idf(self.file)
		print word_to_tf_idf

	def create_word_to_tf_idf(file):
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

	def tf_idf(num_urls_total, num_urls_with_word, local_frequency, max_local_frequency):
		#log(# docs)										*  frequency of word in url
		#(1 + # docs w/ word in it)				 max frequency for any word
		return (math.log(num_urls_total) / (1 + num_urls_with_word)) * (local_frequency / max_local_frequency)

	class Line():
		def __init__(self, line):
			# split up line
			split_line = re.findall('\w+', line)
			self.url_id = split_line[1]
			self.word = split_line[3]
			self.freq = split_line[4]

def main():
	for file in os.listdir(path):
		if file.startswith(prefix_to_part_files):
			t = ThreadClass(file)
			t.start()
			time.sleep(1.0)

if __name__ == "__main__":
	main()
