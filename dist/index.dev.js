"use strict";

var path = require('path');

var express = require('express');

var hbs = require('hbs');

var request = require('request');

var dotenv = require('dotenv');

var bodyParser = require('body-parser');

var mysql = require('mysql');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var app = express();
var count = 0;
var toWatch = false;
dotenv.config({
  path: './private/.env'
});
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
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
var publicDirectoryPath = path.join(__dirname, 'public');
var viewsPath = path.join(__dirname, 'templates/views');
var partialsPath = path.join(__dirname, 'templates/partials'); // Setup handlebars engine and views location

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath); // Setup static directory to serve

app.use(express["static"](publicDirectoryPath));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

checkUser = function checkUser(_ref, res) {
  var username = _ref.username,
      mail = _ref.mail,
      password = _ref.password;
  db.query("SELECT mail FROM users WHERE mail = '".concat(mail, "'"), function _callee(error, result) {
    var hashedPassword;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!error) {
              _context.next = 4;
              break;
            }

            console.log(error);
            _context.next = 12;
            break;

          case 4:
            if (!(result.length == 0)) {
              _context.next = 11;
              break;
            }

            _context.next = 7;
            return regeneratorRuntime.awrap(bcrypt.hash(password, 4));

          case 7:
            hashedPassword = _context.sent;
            //number of times the password is hashed
            db.query("INSERT INTO users(username, password, mail) VALUES('".concat(username, "', '").concat(hashedPassword, "', '").concat(mail, "')"), function (error, result) {
              if (error) {
                console.log(error);
              } else {
                console.log("CE L'HAI FATTA BRUTTO FIGLIO DI PUTTANA!");
                res.render("registration", {
                  message: "Account created successfully",
                  "class": "alert-success"
                });
              }
            });
            _context.next = 12;
            break;

          case 11:
            res.render("registration", {
              message: "This mail is already in use, try another one",
              "class": "alert-danger"
            });

          case 12:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

searchFilm = function searchFilm(name, callback) {
  var url = "https://www.omdbapi.com/?t=".concat(encodeURIComponent(name), "&apikey=").concat(process.env.OMDBKEY);
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      var dataFilm = JSON.parse(body);
      return callback(undefined, dataFilm);
    } else {
      return callback("error", dataFilm);
    }
  });
};

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
            rating: data.imdbRating,
            votes: data.imdbVotes,
            genre: data.Genre,
            poster: data.Poster
          };

          if (count == twFilms.length) {
            toWatch = true;
            res.render("index", {
              twFilms: twFilms
            });
          }
        } else {
          console.log("ERROR");
        }
      });
    });
  } else {
    res.render("index", {
      twFilms: twFilms
    });
  }
});
app.get("/search", function (req, res) {
  var title = req.query.title;

  if (title !== undefined) {
    searchFilm(title, function (err, data) {
      if (!err) {
        if (data.Director === "N/A") {
          data.Director = undefined;
        }

        res.render("searchFilms", {
          data: data
        });
      } else {
        console.log("ERROR");
      }
    });
  } else {
    res.render("searchFilms");
  }
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/registration", function (req, res) {
  res.render("registration");
});
app.post("/registration", function (req, res) {
  checkUser(req.body, res);
}).listen(3000, function () {
  return console.log("Listening on port 3000...");
});