"use strict";

var path = require('path');

var express = require('express');

var hbs = require('hbs');

var request = require('request');

var app = express();
var count = 0;
var toWatch = false;
var twFilms = [{
  name: "Breaking Bad"
}, {
  name: "Game of thrones"
}, {
  name: "Interstellar"
}, {
  name: "titanic"
}, {
  name: "It"
}, {
  name: "American gods"
}, {
  name: "The simpsons"
}, {
  name: "futurama"
}, {
  name: "The martian"
}, {
  name: "8 mile"
}];

searchFilm = function searchFilm(name, callback) {
  var url = "https://www.omdbapi.com/?t=".concat(encodeURIComponent(name), "&apikey=e3e69745");
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      var dataFilm = JSON.parse(body);
      return callback(undefined, dataFilm);
    } else {
      return callback("error", dataFilm);
    }
  });
};

var publicDirectoryPath = path.join(__dirname, 'public');
var viewsPath = path.join(__dirname, 'templates/views');
var partialsPath = path.join(__dirname, 'templates/partials'); // Setup handlebars engine and views location

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath); // Setup static directory to serve

app.use(express["static"](publicDirectoryPath));
app.get('', function (req, res) {
  if (toWatch == false) {
    twFilms.forEach(function (value, index) {
      searchFilm(value.name, function (err, data) {
        count++;

        if (!err) {
          twFilms[index] = {
            imdbID: data.imdbID,
            title: data.Title,
            plot: data.Plot,
            rating: data.imdbRating
          };

          if (count == twFilms.length) {
            toWatch = true;
            res.render("index", {
              twFilms: twFilms
            });
          }
        }
      });
    });
  } else {
    res.render("index", {
      twFilms: twFilms
    });
  }
}).listen(3000, function () {
  return console.log("Listening on port 3000...");
});