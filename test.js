var fs = require('fs')
var Parser = require('./parser.js')

fs.readFile('./fixture.js', function (err, raw)
{
  var data = raw.toString()
  if (err) throw err;
  var parser = new Parser()
  var result = parser
    .split(data)
    .traverseCode()
    .identifyBlocks()
    .renderResult()

  var cbs = result.statistics.commentedBlocks
  var loc = result.statistics.loc
  var templateHeader =
  "<!doctype html><html><head><meta charset=utf-8>" +
  "<style type='text/css'>ul.block{background-color: #f6f8fb; margin-top: 1rem}" +
  "body{background-color: #b0c4de}" +
  "li{list-style-type: none;}" +
  "</style>" +
  "</head>" +
  "<body>" +
  "<div style='margin-bottom: 1.5rem; background-color: #FFDDAA'>" +
  "<h1> Comment Coverage </h1>" +
  "<h2> LOC: " + loc + "</h2>" +
  "<h2> Commented Blocks: " + cbs + "</h2>" +
  "<h2> CB per line: " + (cbs / loc) + "</h2>" +
  "</div>"


  var templateFooter = "</body></html>"
  var output = templateHeader + result.html + templateFooter

  fs.writeFile('./parsed.html', output, function (err)
  {
    if (err) throw err;
    console.log('It\'s saved!');
  })
})

