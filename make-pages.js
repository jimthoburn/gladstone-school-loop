
// 'use strict';

var BASE_URL = 'http://ghs-ausd-ca.schoolloop.com';

var HEAD_ELEMENT_HTML = `
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400i,700,700i|Roboto+Slab:100,300,400,700" />
<link rel="stylesheet" href="/css/shared.css" />
`;

var LOGO_HTML = `
<h2>
    <a href="/">
        <img src="/images/gladstone.png" width="150" alt="" />
        Gladstone High School
    </a>
</h2>
<p>Home of the Mighty Gladiators</p>
`;

var fs = require('fs');
var path = require('path');
var jsdom = require("jsdom");
var serializeDocument = require("jsdom").serializeDocument;

function init() {
  var filePath = path.join(__dirname, 'source/_data/pages.json');

  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
      makePages(JSON.parse(data));
    } else {
      console.log(err);
    }
  });
}

function makePages(pagesData) {
  pagesData.forEach(function(page) {
    if (page.url.indexOf('/') !== 0 || page.url.indexOf('/portal') === 0 || page.url.indexOf('/misc') === 0) {
      console.log('skipped: ' + page.url);
      return;
    }

    var url = BASE_URL + page.url;
    jsdom.env(
      url,
      function (err, window) {

        console.log('creating: ' + url);
        var document = window.document;

        makeAbsolute(document, 'src');
        updateNavigation(document);
        replaceQueryString(document, 'href')
        //makeAbsolute(document, 'href');

        addHeadHTML(document, HEAD_ELEMENT_HTML);

        replaceLogoHTML(document, LOGO_HTML);

        var folder = 'source';

        var fileName = page.url == '/' ? '/index' : page.url;

        console.log('fileName: ' + fileName);

        ensureExists(__dirname + '/' + folder, 0744, function(err) {
            if (err) {
              // handle folder creation error
            } else {
                fs.writeFile(folder + fileName.replace('?', '-') + '.html', serializeDocument(window.document), 'utf8', (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
      }
    );
  });
}

function makeAbsolute(document, attribute) {
  var elements = document.querySelectorAll('*[' + attribute + ']');
  for (var index = 0; index < elements.length; index++) {
    (function(element) {
      var attributeValue = element.getAttribute(attribute);
      if (attributeValue.indexOf('/') === 0) {
        element.setAttribute(attribute, BASE_URL + attributeValue);
      }
    })(elements[index]);
  }
}

function replaceQueryString(document, attribute) {
  var elements = document.querySelectorAll('*[' + attribute + ']');
  for (var index = 0; index < elements.length; index++) {
    (function(element) {
      var attributeValue = element.getAttribute(attribute);
      if (attributeValue.indexOf('?') > 0) {
        element.setAttribute(attribute, attributeValue.replace('?', '-'));
      }
    })(elements[index]);
  }
}

function addHeadHTML(document, html) {
  var head = document.querySelector('head');
  head.innerHTML = head.innerHTML + html;
}

function replaceLogoHTML(document, html) {
  var element = document.querySelector('#container_header a') || document.querySelector('#container_home_header img')

  if (element) {
    element.parentNode.innerHTML = html;
  }
}

function updateHREF(element, value) {
  element.setAttribute('href', value);
}

function updateNavigation(document) {
  var elements = document.querySelectorAll('#public_main a');
  updateHREF(elements[0], '/');
  updateHREF(elements[1], '/ghsgeneralinformation');
  updateHREF(elements[2], '/administration');
  updateHREF(elements[3], '/guidance');
  updateHREF(elements[4], '/activities');
}

// KUDOS: http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist#answer-21196961
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

init();
