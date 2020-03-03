var webScraper = require('./lib/web-scraper')

var url = process.argv[2]

webScraper.scrape(url)
// webScraper.scrape('http://cscloud304.lnu.se:8080/')
