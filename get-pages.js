
var fs = require('fs');
var jsdom = require("jsdom");

var pages = [{url: '/', title: 'Home'}];

jsdom.env(
  "http://ghs-ausd-ca.schoolloop.com/portal/site_map?d=x&return_url=1484179078558",
  function (err, window) {
    var document = window.document;
    var links = document.querySelectorAll('a');
    var href;
    for (var index = 0; index < links.length; index++) {
      href = links[index].getAttribute('href');
      if (href.indexOf('/') !== 0 || href.indexOf('/portal') === 0 || href.indexOf('/misc') === 0) {
        console.log('skipped: ' + href);
        continue;
      }
      pages.push({
        url: href,
        title: links[index].textContent
      });
    }
    fs.writeFile('source/_data/pages.json', JSON.stringify(pages), 'utf8', (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
);
