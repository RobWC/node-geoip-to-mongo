var fs = require('fs');
var mongo = require('mongo');
var db = new mongo.Db('test', new mongo.Server('localhost',27017, {}), {});

console.log(Date());
fs.readFile('./GeoIPCountryWhois.csv', 'utf8', function(err,data){
  var fileArray = data.split('\n');
  for (line in fileArray) {
    var splitLine = fileArray[line].split(',');
    if (splitLine instanceof Array && !!splitLine[5]) {
      console.log(splitLine[5].replace(/\"/g,''));
    };
  }
  console.log(Date());
});