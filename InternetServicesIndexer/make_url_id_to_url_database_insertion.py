#!/usr/bin/env python

import fileinput
import re
import pymongo
import unicodedata

file = "/home/samjalal/public/sameenjalal.com/InternetServices/InternetServicesIndexer/url_store/urls"
mongohq_url = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

conn = pymongo.Connection("linus.mongohq.com", 10002)
db = conn["InternetServices"]
db.authenticate("samjalal", "robin")

class Line():
	def __init__(self, line):
		quote_index = line.index("\"")
		title = line[quote_index + 1: -1]
		try:
			unicode(title, "ascii")
		except UnicodeError:
			title = unicode(title, "utf-8")

		self.title = title.encode('ascii','ignore')

		line = line[:quote_index]
		line = line.strip()
		split_line = re.split('\s+', line)

		self.id = str(split_line[0])
		self.url = str(split_line[1])

def insert_into_mongohq(id, url, title):
	db.url_ids_to_url.insert({"url_num": id, "url": url, "title": title})

def main():
	for line_data in fileinput.input(file):
		line_data = line_data.strip()
		if len(line_data) == 0:
			continue

		line = Line(line_data)
		insert_into_mongohq(line.id, line.url, line.title)

if __name__ == "__main__":
	main()
