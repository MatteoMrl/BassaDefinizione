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

var dbQuery = function dbQuery(queryString) {
  return new Promise(function (resolve) {
    db.query(queryString, function (error, result) {
      if (error) {
        throw error;
      } else {
        resolve(result);
      }
    });
  });
};

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

var loginUser = function loginUser(_ref, res) {
  var username, password, users;
  return regeneratorRuntime.async(function loginUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          username = _ref.username, password = _ref.password;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(dbQuery("SELECT * FROM users WHERE username = '".concat(username, "'")));

        case 4:
          users = _context.sent;
          userData = users[0];
          _context.t0 = !userData;

          if (_context.t0) {
            _context.next = 11;
            break;
          }

          _context.next = 10;
          return regeneratorRuntime.awrap(bcrypt.compare(password, userData.password));

        case 10:
          _context.t0 = !_context.sent;

        case 11:
          if (!_context.t0) {
            _context.next = 15;
            break;
          }

          res.render("login", {
            message: "Incorrect username or password"
          });
          _context.next = 16;
          break;

        case 15:
          createToken(userData.id, res);

        case 16:
          _context.next = 22;
          break;

        case 18:
          _context.prev = 18;
          _context.t1 = _context["catch"](1);
          console.log(_context.t1);
          res.render("login", {
            message: "An error has occurred. Please try again"
          });

        case 22:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 18]]);
};

var userRegistration = function userRegistration(_ref2, res) {
  var username, mail, password, resultMail, hashedPassword;
  return regeneratorRuntime.async(function userRegistration$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          username = _ref2.username, mail = _ref2.mail, password = _ref2.password;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(dbQuery("SELECT mail FROM users WHERE mail = '".concat(mail, "'")));

        case 4:
          resultMail = _context2.sent;

          if (!(resultMail.length < 1)) {
            _context2.next = 13;
            break;
          }

          _context2.next = 8;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 4));

        case 8:
          hashedPassword = _context2.sent;
          //number of times the password is hashed
          dbQuery("INSERT INTO users(username, password, mail) VALUES('".concat(username, "', '").concat(hashedPassword, "', '").concat(mail, "')"));
          loginUser({
            username: username,
            password: password
          }, res);
          _context2.next = 14;
          break;

        case 13:
          res.render("registration", {
            message: "This mail is already in use, try another one",
            "class": "alert-danger"
          });

        case 14:
          _context2.next = 20;
          break;

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](1);
          console.log(_context2.t0);
          res.render("registration", {
            message: "An error has occurred. Please try again",
            "class": "alert-danger"
          });

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 16]]);
};

var searchFilm = function searchFilm(name) {
  var url, response;
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
          return _context3.abrupt("return", response.json());

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](1);
          console.log(_context3.t0);

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 8]]);
};

var renderFilms = function renderFilms(genre, res) {
  var listOfTitles, listOfFilms, count;
  return regeneratorRuntime.async(function renderFilms$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (!genre) {
            genre = "Action";
          }

          _context5.prev = 1;
          _context5.next = 4;
          return regeneratorRuntime.awrap(dbQuery("SELECT DISTINCT films.title\n      FROM films\n      INNER JOIN genreFilm ON films.title=genreFilm.title\n      WHERE genreFilm.genre = '".concat(genre, "'")));

        case 4:
          listOfTitles = _context5.sent;
          listOfFilms = [];
          count = 0;
          listOfTitles.forEach(function _callee(film) {
            var data, Title, Plot, imdbRating, imdbVotes, Genre, Poster, usersVotes, Appreciation;
            return regeneratorRuntime.async(function _callee$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap(searchFilm(film.title));

                  case 2:
                    data = _context4.sent;
                    Title = data.Title, Plot = data.Plot, imdbRating = data.imdbRating, imdbVotes = data.imdbVotes, Genre = data.Genre, Poster = data.Poster;
                    _context4.next = 6;
                    return regeneratorRuntime.awrap(dbQuery("SELECT liked FROM votes WHERE title = '".concat(Title, "'")));

                  case 6:
                    usersVotes = _context4.sent;
                    Appreciation = Math.floor(usersVotes.reduce(function (sum, current) {
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

                    if (count === listOfTitles.length) {
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

                  case 11:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          });
          _context5.next = 13;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](1);
          console.log(_context5.t0);

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 10]]);
};

var voteFilm = function voteFilm(title, vote, userIDreq, res) {
  var data, genres, userID, firstVote;
  return regeneratorRuntime.async(function voteFilm$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(searchFilm(title));

        case 3:
          data = _context7.sent;
          //prendo i dati del film
          genres = data.Genre.split(", ").filter(function (genre) {
            return !genre.includes("-");
          } //creo una lista dei generi del film, escludendo quelli che hanno al loro interno "-" (sci-fi)
          );
          _context7.next = 7;
          return regeneratorRuntime.awrap(dbQuery("SELECT userID FROM films WHERE title = '".concat(title, "' AND userID = '").concat(userIDreq, "'") //controllo se l'utente ha già votato quel film
          ));

        case 7:
          userID = _context7.sent;

          if (!(userID.length < 1)) {
            _context7.next = 16;
            break;
          }

          //l'utente non ha già votato il film
          dbQuery("INSERT INTO films VALUES('".concat(title, "', '").concat(userIDreq, "', ").concat(vote, ")")); //inserisco titolo, voto e id dell'utente nella tabella films

          _context7.next = 12;
          return regeneratorRuntime.awrap(dbQuery("SELECT title FROM genreFilm WHERE title = '".concat(title, "'") //controllo che il film non sia presente nella tabella genreFilm
          ));

        case 12:
          firstVote = _context7.sent;

          if (!firstVote.length) {
            genres.forEach(function _callee2(genre) {
              return regeneratorRuntime.async(function _callee2$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      //scorro i generi del film
                      dbQuery("INSERT INTO genreFilm VALUES('".concat(title, "', '").concat(genre, "')")); //inserisci titolo e UN genere del film nella tabella genreFilm

                    case 1:
                    case "end":
                      return _context6.stop();
                  }
                }
              });
            });
          }

          _context7.next = 17;
          break;

        case 16:
          db.query("UPDATE films SET liked = ".concat(vote, " WHERE title = '").concat(title, "' AND userID = '").concat(userIDreq, "'") //se l'utente ha già votato il film, il voto è aggiornato
          );

        case 17:
          res.send({
            vote: true
          });
          _context7.next = 23;
          break;

        case 20:
          _context7.prev = 20;
          _context7.t0 = _context7["catch"](0);
          console.log(_context7.t0);

        case 23:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 20]]);
};

var favoriteFilms = function favoriteFilms(userID, res) {
  var userFilms, userGenres, filterUserGenres, results, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, result, allData, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

  return regeneratorRuntime.async(function favoriteFilms$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          //prende tutti i film votati piaciuti all'utente e li renderizza --> pesante ma evito altre chiamate
          userFilms = [];
          userGenres = listOfGenres; //copio la lista dei generi globale in modo da poterla modificare in base all'utente

          filterUserGenres = listOfGenres;
          userGenres = userGenres.map( //la lista dei generi dell'utente diventa una di promise
          function (genre) {
            return dbQuery("SELECT DISTINCT films.title\n        FROM films\n        INNER JOIN \tgenreFilm ON genreFilm.genre = '".concat(genre, "' AND genreFilm.title = films.title AND userID = ").concat(userID, ";"));
          });
          _context8.prev = 4;
          _context8.next = 7;
          return regeneratorRuntime.awrap(Promise.all(userGenres));

        case 7:
          results = _context8.sent;
          //attraverso Promise.all creo un'unica promise partendo dalla lista di esse
          console.log(results);
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context8.prev = 12;
          _iterator = results[Symbol.iterator]();

        case 14:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context8.next = 47;
            break;
          }

          result = _step.value;

          if (!(result.length !== 0)) {
            _context8.next = 43;
            break;
          }

          //se sono presenti 1 o + film votati dall'utente in quel genere allora li scorre
          result = result.map(function (_ref3) {
            var title = _ref3.title;
            return searchFilm(title);
          }); //la lista dei risultati diventa una di promise (searchFilm è una promise avendo async)

          _context8.next = 20;
          return regeneratorRuntime.awrap(Promise.all(result));

        case 20:
          allData = _context8.sent;
          //stesso procedimento di results
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context8.prev = 24;

          _loop = function _loop() {
            var data = _step2.value;

            if (!userFilms.some(function (e) {
              return e.Title === data.Title;
            })) {
              //se nella lista dei film dell'utente non è presente quello appena cercato lo aggiunge
              //questo viene fatto per evitare che film con più generi vengano aggiunti più volte
              var Title = data.Title,
                  imdbRating = data.imdbRating,
                  Poster = data.Poster,
                  Genre = data.Genre;
              userFilms.push({
                Title: Title,
                imdbRating: imdbRating,
                Poster: Poster,
                Genre: Genre
              });
            }
          };

          for (_iterator2 = allData[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _loop();
          }

          _context8.next = 33;
          break;

        case 29:
          _context8.prev = 29;
          _context8.t0 = _context8["catch"](24);
          _didIteratorError2 = true;
          _iteratorError2 = _context8.t0;

        case 33:
          _context8.prev = 33;
          _context8.prev = 34;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 36:
          _context8.prev = 36;

          if (!_didIteratorError2) {
            _context8.next = 39;
            break;
          }

          throw _iteratorError2;

        case 39:
          return _context8.finish(36);

        case 40:
          return _context8.finish(33);

        case 41:
          _context8.next = 44;
          break;

        case 43:
          (function () {
            var emptyGenre = listOfGenres[results.indexOf(result)];
            filterUserGenres = filterUserGenres.filter(function (userGenre) {
              return userGenre !== emptyGenre;
            });
          })();

        case 44:
          _iteratorNormalCompletion = true;
          _context8.next = 14;
          break;

        case 47:
          _context8.next = 53;
          break;

        case 49:
          _context8.prev = 49;
          _context8.t1 = _context8["catch"](12);
          _didIteratorError = true;
          _iteratorError = _context8.t1;

        case 53:
          _context8.prev = 53;
          _context8.prev = 54;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 56:
          _context8.prev = 56;

          if (!_didIteratorError) {
            _context8.next = 59;
            break;
          }

          throw _iteratorError;

        case 59:
          return _context8.finish(56);

        case 60:
          return _context8.finish(53);

        case 61:
          res.render("user", {
            userFilms: userFilms,
            userGenres: filterUserGenres
          });
          _context8.next = 67;
          break;

        case 64:
          _context8.prev = 64;
          _context8.t2 = _context8["catch"](4);
          console.log(_context8.t2);

        case 67:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[4, 64], [12, 49, 53, 61], [24, 29, 33, 41], [34,, 36, 40], [54,, 56, 60]]);
};

var renderUser = function renderUser(_ref4, res) {
  var username, result, id;
  return regeneratorRuntime.async(function renderUser$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          username = _ref4.username;
          _context9.prev = 1;
          _context9.next = 4;
          return regeneratorRuntime.awrap(dbQuery("SELECT id FROM users WHERE username = '".concat(username, "'")));

        case 4:
          result = _context9.sent;

          if (!(result.length === 1)) {
            _context9.next = 10;
            break;
          }

          id = result[0].id;
          favoriteFilms(id, res);
          _context9.next = 11;
          break;

        case 10:
          throw new Error("id not found");

        case 11:
          _context9.next = 16;
          break;

        case 13:
          _context9.prev = 13;
          _context9.t0 = _context9["catch"](1);
          console.log(_context9.t0);

        case 16:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[1, 13]]);
}; //----------------------------------------------------------------------------------------------------


(function _callee3() {
  return regeneratorRuntime.async(function _callee3$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(dbQuery("SELECT name FROM genres"));

        case 2:
          listOfGenres = _context10.sent;
          listOfGenres = listOfGenres.map(function (genre) {
            return genre.name;
          });

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  });
})(); //-----------------------------------------------------------------------------------------------------


app.get("", function (req, res) {
  renderFilms(req.query.genre, res);
});
app.get("/user/:username", function (req, res) {
  res.render("index", {
    allFilms: allFilms
  });
});
app.post("/user/:username", function (req, res) {
  renderUser(req.params, res);
});
app.get("/search", function _callee4(req, res) {
  var title, data;
  return regeneratorRuntime.async(function _callee4$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          title = req.query.title;

          if (!title) {
            _context11.next = 15;
            break;
          }

          _context11.prev = 2;
          _context11.next = 5;
          return regeneratorRuntime.awrap(searchFilm(title));

        case 5:
          data = _context11.sent;

          if (data.Director === "N/A") {
            data.Director = undefined;
          }

          res.render("searchFilms", {
            data: data
          });
          _context11.next = 13;
          break;

        case 10:
          _context11.prev = 10;
          _context11.t0 = _context11["catch"](2);
          console.log(_context11.t0);

        case 13:
          _context11.next = 16;
          break;

        case 15:
          res.render("searchFilms");

        case 16:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[2, 10]]);
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
app.post("/token", verifyToken, function _callee5(req, res) {
  var result, _userData;

  return regeneratorRuntime.async(function _callee5$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          if (!(req.id !== undefined)) {
            _context12.next = 14;
            break;
          }

          _context12.prev = 1;
          _context12.next = 4;
          return regeneratorRuntime.awrap(dbQuery("SELECT * FROM users WHERE id = '".concat(req.id, "'")));

        case 4:
          result = _context12.sent;
          _userData = result[0];
          res.send({
            username: _userData.username,
            id: _userData.id
          });
          _context12.next = 12;
          break;

        case 9:
          _context12.prev = 9;
          _context12.t0 = _context12["catch"](1);
          res.send({
            username: undefined
          });

        case 12:
          _context12.next = 15;
          break;

        case 14:
          res.send({
            username: undefined
          });

        case 15:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[1, 9]]);
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