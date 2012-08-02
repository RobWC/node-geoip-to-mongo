var fs = require('fs');
var util = require('util');
var events = require('events');
//
var mongodb = require('mongodb');
var lazy = require("lazy");
//
var geoArray = new Array();
var server = new mongodb.Server("127.0.0.1", 27017, {});

var db = new mongodb.Db('geo', server, {});

var GeoParser = function(filename) {
  events.EventEmitter.call(this);
  this.filename = filename;
};

util.inherits(GeoParser, events.EventEmitter);

GeoParser.prototype.parseFile = function() {
  var self = this;
  try {
    new lazy(fs.createReadStream(self.filename)).lines.forEach(function(line) {
      var splitLine = line.toString().split(',');
      if (splitLine instanceof Array && !! splitLine[9]) {
        self.emit('record', new GeoCityEntry(splitLine[0].replace(/\"/g, ''), splitLine[1].replace(/\"/g, ''), splitLine[2].replace(/\"/g, ''), splitLine[3].replace(/\"/g, ''), splitLine[4].replace(/\"/g, ''), splitLine[5].replace(/\"/g, ''), splitLine[6].replace(/\"/g, ''), splitLine[7].replace(/\"/g, ''), splitLine[8].replace(/\"/g, ''), splitLine[9].replace(/\"/g, '')))
      };
    });
  } catch (error) {
    console.log('Unable to open file');
  };
};

var GeoEntry = function(subnetStart, subnetEnd, numberStart, numberEnd, countryCode, countryString) {
  this.subnetStart = subnetStart, this.subnetEnd = subnetEnd, this.numberStart = parseInt(numberStart), this.numberEnd = parseInt(numberEnd), this.countryCode = countryCode, this.countryString = countryString
};

var GeoCityEntry = function(startIpNum, endIpNum, country, region, city, postalCode, latitude, longitude, dmaCode, areaCode) {
  this.startIp = startIpNum, this.startIpNum = ipToNum(startIpNum), this.endIpNum = ipToNum(endIpNum), this.endIp = endIpNum, this.country = country, this.region = region, this.city = city, this.postalCode = postalCode, this.latitude = latitude, this.longitude = longitude, this.dmaCode = dmaCode, this.areaCode = areaCode
};

var ipToNum = function(ip) {
  var ipArray = ip.split('.');
  return (16777216 * ipArray[0]) + (65536 * ipArray[1]) + (256 * ipArray[2]) + (ipArray[3]);
}

var geoParse = new GeoParser(process.argv[2]);
geoParse.parseFile();

db.open(function(err, result) {
  db.dropCollection('iptocncity', function(err, result) {
    geoParse.on('record', function(data) {
      db.collection('iptocncity', function(err, collection) {
        collection.insert(data);
      });
    });
  });
});