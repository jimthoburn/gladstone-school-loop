
'use strict';

var OPTIONS = require('./make-pages-options.js');

var fs = require('fs');
var path = require('path');
var jsdom = require("jsdom");
var serializeDocument = require("jsdom").serializeDocument;

function init() {
  var filePath = path.join(__dirname, '../_data/pages.json');

  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
      makePages(JSON.parse(data));
    } else {
      console.log(err);
    }
  });
}

function makePages(pagesData) {
  pagesData.forEach(function(section) {
    section.pages.forEach(function(page) {
      var url = OPTIONS.BASE_URL + page.url;
      jsdom.env(
        url,
        function (err, window) {

          console.log('creating: ' + url);
          var document = window.document;

          makeAbsolute(document, 'src');
          updateNavigation(document, pagesData);
          replaceQueryString(document, 'href')
          //makeAbsolute(document, 'href');

          addHeadHTML(document, OPTIONS.HEAD_ELEMENT_HTML);

          replaceLogoHTML(document, OPTIONS.LOGO_HTML);

          var fileName = (page.url == '/') ? '/index' : page.url;

          fs.writeFile('../' + fileName.replace('?', '-') + '.html', serializeDocument(window.document), 'utf8', (err) => {
              if (err) {
                  console.log(err);
              }
          });
        }
      );
    });
  });
}

function makeAbsolute(document, attribute) {
  var elements = document.querySelectorAll('*[' + attribute + ']');
  for (var index = 0; index < elements.length; index++) {
    (function(element) {
      var attributeValue = element.getAttribute(attribute);
      if (attributeValue.indexOf('/') === 0) {
        element.setAttribute(attribute, OPTIONS.BASE_URL + attributeValue);
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

function updateNavigation(document, pagesData) {
  var elements = document.querySelectorAll('#public_main a');
  for (var index = 0; index < elements.length; index++) {
    elements[index].setAttribute('href', pagesData[index].pages[0].url);
  }
}

init();
