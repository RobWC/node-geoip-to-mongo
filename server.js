var fs = require('fs');
var mongo = require('mongodb');
var geoArray = new Array();
var recordCount = 1;

var GeoEntry = function(subnetStart, subnetEnd, numberStart, numberEnd, countryCode, countryString) {
  this.subnetStart = subnetStart, this.subnetEnd = subnetEnd, this.numberStart = numberStart, this.numberEnd = numberEnd, this.countryCode = countryCode, this.countryString = countryString
};

GeoEntry.constructor = GeoEntry;

var pushToMongo = function(array) {
  var db = new mongo.Db('geo', new mongo.Server('localhost', 27017, {}), {});
  db.open(function(err, result) {
    db.dropCollection('iptocn', function(err, result) {
      db.collection('iptocn', function(err, collection) {
        for (item in array) {
          collection.insert(array[item], function(err, docs) {
            if (err) {
              console.log(err);
            } else {
              //continue
              process.stdout.write(".");
              recordCount++;
            };
          });
        };
        console.log('');
        console.log('Insert complete - Total Records: ' + recordCount);
        db.close();
        return 0;
      });
    });
  });
};

console.log('');
process.stdout.write('Starting File Read...');
var data = fs.readFileSync('./GeoIPCountryWhois.csv', 'utf8');
process.stdout.write("Complete!");

console.log('');
process.stdout.write('Starting File Parse...');
var fileArray = data.split('\n');
for (line in fileArray) {
  process.stdout.write(".");
  var splitLine = fileArray[line].split(',');
  if (splitLine instanceof Array && !! splitLine[5]) {
    var geoEnt = new GeoEntry(splitLine[0].replace(/\"/g, ''), splitLine[1].replace(/\"/g, ''), splitLine[2].replace(/\"/g, ''), splitLine[3].replace(/\"/g, ''), splitLine[4].replace(/\"/g, ''), splitLine[5].replace(/\"/g, ''));
    geoArray.push(geoEnt);
  };
};
process.stdout.write("Complete!");

console.log('');
console.log('Starting Insert...')
pushToMongo(geoArray);