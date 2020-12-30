"use strict";

var path = require("path");

var express = require("express");

var hbs = require("hbs");

var fetch = require("node-fetch");

var dotenv = require("dotenv");

var bodyParser = require("body-parser");

var mysql = require("mysql");

var jwt = require("jsonwebtoken");

var bcrypt = require("bcryptjs");

var cookieParser = require("cookie-parser");

var atob = require("atob");

var _require = require("process"),
    title = _require.title;

var app = express();
var fvCount = 0;
var userData;
var listOfGenres = [];
dotenv.config({
  path: "./private/.env"
});
var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
var publicDirectoryPath = path.join(__dirname, "public");
var viewsPath = path.join(__dirname, "templates/views");
var partialsPath = path.join(__dirname, "templates/partials"); // Setup handlebars engine and views location

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath); // Setup static directory to serve

app.use(express["static"](publicDirectoryPath));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser()); //-----------------------------------------------------------------------------------------------

function encodeToken(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(atob(base64));
}

function verifyToken(req, res, next) {
  // Get auth header value
  var bearerHeader = req.headers["authorization"]; // Check if bearer is undefined

  if (bearerHeader !== "undefined") {
    // Split at the space
    var bearer = bearerHeader.split(" "); // Get token from array

    var token = bearer[1];

    if (jwt.verify(token, process.env.JWT_SECRETKEY)) {
      // Set the token
      req.id = encodeToken(token).id; // Next middleware

      next();
    } else {
      res.render("error404");
    }
  } else {
    // Forbidden
    res.render("error404");
  }
}

function createToken(id, res) {
  var token = jwt.sign({
    id: id.toString()
  }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
  };
  res.cookie("jwt", token, cookieOptions);
  renderFilms(null, res);
}

function userRegistration(_ref, res) {
  var username = _ref.username,
      mail = _ref.mail,
      password = _ref.password;
  db.query("SELECT mail FROM users WHERE mail = '".concat(mail, "'"), function _callee(error, result) {
    var hashedPassword;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(result.length < 1)) {
              _context.next = 7;
              break;
            }

            _context.next = 3;
            return regeneratorRuntime.awrap(bcrypt.hash(password, 4));

          case 3:
            hashedPassword = _context.sent;
            //number of times the password is hashed
            db.query("INSERT INTO users(username, password, mail) VALUES('".concat(username, "', '").concat(hashedPassword, "', '").concat(mail, "')"), function (error, result) {
              res.render("registration", {
                message: "Account created successfully",
                "class": "alert-success"
              });
            });
            _context.next = 8;
            break;

          case 7:
            res.render("registration", {
              message: "This mail is already in use, try another one",
              "class": "alert-danger"
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    });
  });
}

function loginUser(_ref2, res) {
  var username = _ref2.username,
      password = _ref2.password;
  db.query("SELECT * FROM users WHERE username = '".concat(username, "'"), function _callee2(error, result) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            userData = result[0];
            _context2.t0 = !userData;

            if (_context2.t0) {
              _context2.next = 6;
              break;
            }

            _context2.next = 5;
            return regeneratorRuntime.awrap(bcrypt.compare(password, userData.password));

          case 5:
            _context2.t0 = !_context2.sent;

          case 6:
            if (!_context2.t0) {
              _context2.next = 10;
              break;
            }

            res.render("login", {
              message: "Incorrect username or password"
            });
            _context2.next = 11;
            break;

          case 10:
            createToken(userData.id, res);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
}

function searchFilm(name) {
  var url, response, data;
  return regeneratorRuntime.async(function searchFilm$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          url = "https://www.omdbapi.com/?t=".concat(encodeURIComponent(name), "&apikey=").concat(process.env.OMDBKEY);
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(fetch(url));

        case 4:
          response = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(response.json());

        case 7:
          data = _context3.sent;
          return _context3.abrupt("return", data);

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](1);
          console.log(_context3.t0);

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 11]]);
}

var renderFilms = function renderFilms(genre, res) {
  if (!genre) {
    genre = "Action";
  }

  db.query("SELECT DISTINCT title FROM ".concat(genre, ";"), function _callee4(error, result) {
    var listOfFilms, count;
    return regeneratorRuntime.async(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            listOfFilms = [];
            count = 0;
            result.forEach(function _callee3(film) {
              var data, Title, Plot, imdbRating, imdbVotes, Genre, Poster;
              return regeneratorRuntime.async(function _callee3$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.next = 2;
                      return regeneratorRuntime.awrap(searchFilm(film.title));

                    case 2:
                      data = _context4.sent;
                      Title = data.Title, Plot = data.Plot, imdbRating = data.imdbRating, imdbVotes = data.imdbVotes, Genre = data.Genre, Poster = data.Poster;
                      db.query("SELECT * FROM ".concat(genre, " WHERE title = '").concat(Title, "'"), function (error, usersVotes) {
                        var Appreciation = Math.floor(usersVotes.reduce(function (sum, current) {
                          return sum + current.liked;
                        }, 0) * 100 / usersVotes.length);
                        listOfFilms.push({
                          Title: Title,
                          Plot: Plot,
                          Rating: imdbRating,
                          Votes: imdbVotes,
                          Appreciation: Appreciation,
                          Genre: Genre,
                          Poster: Poster
                        });
                        count++;

                        if (count === result.length) {
                          //utlizzo count poichè il foreach non so come metterlo asincrono e perciò se avessi
                          listOfFilms.sort(function (a, b) {
                            return b.Rating - a.Rating;
                          }); //film ordinati per voto decrescente

                          res.render("index", {
                            genre: genre,
                            listOfFilms: listOfFilms,
                            listOfGenres: listOfGenres
                          });
                        }
                      });

                    case 5:
                    case "end":
                      return _context4.stop();
                  }
                }
              });
            });

          case 3:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
};

var voteFilm = function voteFilm(title, vote, userID, res) {
  var data, genres;
  return regeneratorRuntime.async(function voteFilm$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(searchFilm(title));

        case 2:
          data = _context6.sent;
          genres = data.Genre.split(", ").filter(function (genre) {
            return !genre.includes("-");
          });
          genres.forEach(function (genre) {
            db.query("SELECT userID FROM ".concat(genre, " WHERE title = '").concat(title, "' AND userID = '").concat(userID, "'"), function (error, result) {
              if (error) {
                res.status(400);
              } else {
                if (result.length < 1) {
                  db.query("INSERT INTO ".concat(genre, " VALUES('").concat(title, "', '").concat(vote, "', '").concat(userID, "')"));
                } else {
                  db.query("UPDATE ".concat(genre, " SET liked = '").concat(vote, "' WHERE title = '").concat(title, "' AND userID = '").concat(userID, "'"));
                }
              }
            });
          });
          res.send({
            vote: true
          });

        case 6:
        case "end":
          return _context6.stop();
      }
    }
  });
};

function favoriteFilms(userID, res) {
  var userFilms = [];
  listOfGenres.forEach(function (genre) {
    db.query("SELECT title FROM ".concat(genre, " WHERE userID = ").concat(userID, " AND liked = 1;"), function _callee5(error, result) {
      return regeneratorRuntime.async(function _callee5$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              result.forEach(function (film) {
                return userFilms.push(film);
              });

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      });
    });
  });
  /*let listOfFilms = [];
      let count = 0;
      result.forEach(async (film) => {
        const data = await searchFilm(film.title);
        const { Title, Plot, imdbRating, imdbVotes, Genre, Poster } = data;
        db.query(
          `SELECT * FROM ${genre} WHERE title = '${Title}'`,
          (error, usersVotes) => {
            const Appreciation = Math.floor(
              (usersVotes.reduce((sum, current) => sum + current.liked, 0) *
                100) /
                usersVotes.length
            );
            listOfFilms.push({
              Title,
              Plot,
              Rating: imdbRating,
              Votes: imdbVotes,
              Appreciation,
              Genre,
              Poster,
            });
            count++;
            if (count === result.length) {
              //utlizzo count poichè il foreach non so come metterlo asincrono e perciò se avessi
              listOfFilms.sort((a, b) => b.Rating - a.Rating); //film ordinati per voto decrescente
              res.render("index", {
                genre,
                listOfFilms,
                listOfGenres,
              });
            }
          }
        );
      });*/

  /*
  db.query(
    `SELECT * FROM films WHERE userID = '${userID}' ORDER BY rating DESC`,
    (error, result) => {
      let userFilms = [];
      if (result.length === 0) {
        res.render("user");
      } else {
        result.forEach((value) => {
          searchFilm(value.title, (data) => {
            fvCount++;
            userFilms.push({
              title: data.Title,
              rating: value.rating,
              poster: data.Poster,
            });
            if (fvCount == result.length) {
              res.render("user", { userFilms });
              fvCount = 0;
              userFilms = [];
            }
          });
        });
      }
    }
  );
  */
} //----------------------------------------------------------------------------------------------------


db.query("SHOW TABLES", function (error, result) {
  result.forEach(function (genre) {
    return listOfGenres.push({
      genre: genre.Tables_in_bassadefinizione
    });
  });
  listOfGenres.pop();
  console.log("CREATA LA LISTA DEI GENERI");
});
app.get("", function (req, res) {
  renderFilms(req.query.genre, res);
});
app.get("/user/:username", function (req, res) {
  res.render("index", {
    allFilms: allFilms
  });
});
app.post("/user/:username", function (req, res) {
  var username = req.params.username;
  db.query("SELECT id FROM users WHERE username = '".concat(username, "'"), function (error, result) {
    if (result.length === 1) {
      var id = result[0].id;
      favoriteFilms(id, res);
    } else {
      res.end();
    }
  });
});
app.get("/search", function _callee6(req, res) {
  var title, data;
  return regeneratorRuntime.async(function _callee6$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          title = req.query.title;

          if (!title) {
            _context8.next = 9;
            break;
          }

          _context8.next = 4;
          return regeneratorRuntime.awrap(searchFilm(title));

        case 4:
          data = _context8.sent;

          if (data.Director === "N/A") {
            data.Director = undefined;
          }

          res.render("searchFilms", {
            data: data
          });
          _context8.next = 10;
          break;

        case 9:
          res.render("searchFilms");

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  });
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", function (req, res) {
  loginUser(req.body, res);
});
app.get("/registration", function (req, res) {
  res.render("registration");
});
app.post("/registration", function (req, res) {
  userRegistration(req.body, res);
});
app.post("/token", verifyToken, function (req, res) {
  if (req.id !== undefined) {
    db.query("SELECT * FROM users WHERE id = '".concat(req.id, "'"), function (error, result) {
      var userData = result[0];
      res.send({
        username: userData.username,
        id: userData.id
      });
    });
  } else {
    res.send({
      username: undefined
    });
  }
});
app.get("/vote", verifyToken, function (req, res) {
  var _req$query = req.query,
      film = _req$query.film,
      vote = _req$query.vote;
  voteFilm(film, vote, req.id, res);
});
app.get("/logout", function (req, res) {
  renderFilms(null, res);
});
app.get("*", function (req, res) {
  return res.status(404).render("error404");
}).listen(80, function () {
  return console.log("Listening on port 80...");
});