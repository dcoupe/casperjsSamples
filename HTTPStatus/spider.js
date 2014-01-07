phantom.outputEncoding="gbk"; 

var startUrl = 'http://www.gongtianxia.com/';

var visitedUrls = [], pendingUrls = [], statusUrls = [];


var casper = require('casper').create({});
var utils = require('utils')
var helpers = require('./helpers')

function spider(url) {

	visitedUrls.push(url);

	casper.open(url).then(function() {

		var status = this.status().currentHTTPStatus;

		this.echo(status + ' ' + url +' '+new Date().toLocaleTimeString());

		if(status != 200){
			statusUrls.push(status +' '+url +' '+new Date().toLocaleTimeString());
		}
		

		var links = this.evaluate(function() {
			var links = [];
			Array.prototype.forEach.call(__utils__.findAll('a'), function(e) {
				links.push(e.getAttribute('href'));
			});
			return links;
		});


		var baseUrl = this.getGlobal('location').origin;
		Array.prototype.forEach.call(links, function(link) {
			var newUrl = helpers.absoluteUri(baseUrl, link);
			if (pendingUrls.indexOf(newUrl) == -1 && visitedUrls.indexOf(newUrl) == -1 && newUrl.indexOf('www.gongtianxia.com') > 0  &&  newUrl.indexOf('#') == -1) {
				pendingUrls.push(newUrl);	
			}
		});

		if (pendingUrls.length > 0) {
			var nextUrl = pendingUrls.shift();
			this.echo(visitedUrls.length);
			spider(nextUrl);
		}else{
			 this.then(buildPage);
			 this.echo("end！");
		}

	});

}

function buildPage(){
    var fs, pageHtml;
    this.echo("Build result page");
    fs = require("fs");
    this.viewport(624, 400);
    pageHtml = "<!DOCTYPE html><html><head><meta charset='utf-8'/></head><body style='margin:0;padding:0'>";
    statusUrls.forEach(function(i) {
        pageHtml += i+"<br>";
    });
    pageHtml += "</body></html>";
    fs.write("result.html", pageHtml, 'w');
};



casper.start(startUrl, function() {
	spider(startUrl);
});


casper.run();