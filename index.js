"use strict";
const path = require("path");
const express = require("express");
const hbs = require("hbs");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const atob = require("atob");
const { title } = require("process");
const app = express();
let fvCount = 0;
let userData;
let listOfGenres = [];
dotenv.config({ path: "./private/.env" });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const publicDirectoryPath = path.join(__dirname, "public");
const viewsPath = path.join(__dirname, "templates/views");
const partialsPath = path.join(__dirname, "templates/partials");

// Setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
// Setup static directory to serve
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

//-----------------------------------------------------------------------------------------------

function encodeToken(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(atob(base64));
}

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const token = bearer[1];
    if (jwt.verify(token, process.env.JWT_SECRETKEY)) {
      // Set the token
      req.id = encodeToken(token).id;
      // Next middleware
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
  const token = jwt.sign({ id: id.toString() }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  };
  res.cookie("jwt", token, cookieOptions);
  renderFilms(null, res);
}

function userRegistration({ username, mail, password }, res) {
  db.query(
    `SELECT mail FROM users WHERE mail = '${mail}'`,
    async (error, result) => {
      if (result.length < 1) {
        let hashedPassword = await bcrypt.hash(password, 4); //number of times the password is hashed
        db.query(
          `INSERT INTO users(username, password, mail) VALUES('${username}', '${hashedPassword}', '${mail}')`,
          (error, result) => {
            res.render("registration", {
              message: "Account created successfully",
              class: "alert-success",
            });
          }
        );
      } else {
        res.render("registration", {
          message: "This mail is already in use, try another one",
          class: "alert-danger",
        });
      }
    }
  );
}

function loginUser({ username, password }, res) {
  db.query(
    `SELECT * FROM users WHERE username = '${username}'`,
    async (error, result) => {
      userData = result[0];
      if (!userData || !(await bcrypt.compare(password, userData.password))) {
        res.render("login", { message: "Incorrect username or password" });
      } else {
        createToken(userData.id, res);
      }
    }
  );
}

async function searchFilm(name) {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(name)}&apikey=${
    process.env.OMDBKEY
  }`;
  try {
    const response = await fetch(url);
    const data = await response.json(); //.json è una promise perciò c'è bisogno di await
    return data;
  } catch (err) {
    console.log(err);
  }
}

const renderFilms = (genre, res) => {
  if (!genre) {
    genre = "Action";
  }
  db.query(`SELECT DISTINCT title FROM ${genre};`, async (error, result) => {
    let listOfFilms = [];
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
    });
  });
};

const voteFilm = async (title, vote, userID, res) => {
  const data = await searchFilm(title);
  const genres = data.Genre.split(", ").filter((genre) => !genre.includes("-"));
  genres.forEach((genre) => {
    db.query(
      `SELECT userID FROM ${genre} WHERE title = '${title}' AND userID = '${userID}'`,
      (error, result) => {
        if (error) {
          res.status(400);
        } else {
          if (result.length < 1) {
            db.query(
              `INSERT INTO ${genre} VALUES('${title}', '${vote}', '${userID}')`
            );
          } else {
            db.query(
              `UPDATE ${genre} SET liked = '${vote}' WHERE title = '${title}' AND userID = '${userID}'`
            );
          }
        }
      }
    );
  });
  res.send({ vote: true });
};

function favoriteFilms(userID, res) {
  let userFilms = [];
  listOfGenres.forEach((genre) => {
    db.query(
      `SELECT title FROM ${genre} WHERE userID = ${userID} AND liked = 1;`,
      async (error, result) => {
        result.forEach((film) => userFilms.push(film));
      }
    );
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
}

//----------------------------------------------------------------------------------------------------

db.query("SHOW TABLES", (error, result) => {
  result.forEach((genre) =>
    listOfGenres.push({ genre: genre.Tables_in_bassadefinizione })
  );
  listOfGenres.pop();
  console.log("CREATA LA LISTA DEI GENERI");
});

app.get("", (req, res) => {
  renderFilms(req.query.genre, res);
});

app.get("/user/:username", (req, res) => {
  res.render("index", { allFilms });
});

app.post("/user/:username", (req, res) => {
  const username = req.params.username;
  db.query(
    `SELECT id FROM users WHERE username = '${username}'`,
    (error, result) => {
      if (result.length === 1) {
        const id = result[0].id;
        favoriteFilms(id, res);
      } else {
        res.end();
      }
    }
  );
});

app.get("/search", async (req, res) => {
  const title = req.query.title;
  if (title) {
    const data = await searchFilm(title);
    if (data.Director === "N/A") {
      data.Director = undefined;
    }
    res.render("searchFilms", { data });
  } else {
    res.render("searchFilms");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  loginUser(req.body, res);
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

app.post("/registration", (req, res) => {
  userRegistration(req.body, res);
});

app.post("/token", verifyToken, (req, res) => {
  if (req.id !== undefined) {
    db.query(`SELECT * FROM users WHERE id = '${req.id}'`, (error, result) => {
      let userData = result[0];
      res.send({ username: userData.username, id: userData.id });
    });
  } else {
    res.send({ username: undefined });
  }
});

app.get("/vote", verifyToken, (req, res) => {
  const { film, vote } = req.query;
  voteFilm(film, vote, req.id, res);
});

app.get("/logout", (req, res) => {
  renderFilms(null, res);
});

app
  .get("*", (req, res) => res.status(404).render("error404"))

  .listen(80, () => console.log("Listening on port 80..."));
