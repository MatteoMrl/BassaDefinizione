const express = require("express")
const path = require("path")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const atob = require("atob")
const bcrypt = require("bcryptjs")
const fetch = require("node-fetch")

const publicDirectoryPath = path.join(__dirname, "public")
app.use(express.static(publicDirectoryPath))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

dotenv.config({ path: "./private/.env" })

// DATABASE SECTION ------------------------------------------------------------------

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

const dbQuery = (queryString, parametres) => {
  return new Promise((resolve) => {
    connection.query(queryString, parametres, (error, result) => {
      if (error) {
        throw error
      } else {
        resolve(result)
      }
    })
  })
}

// JWT SECTION ------------------------------------------------------------------

const createToken = (id, res) => {
  const token = jwt.sign({ id: id.toString() }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  }
  res.cookie("jwt", token, cookieOptions).json({ token })
}

const encodeToken = (token) => {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace("-", "+").replace("_", "/")
  return JSON.parse(atob(base64))
}

const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"]
  // Check if bearer is undefined
  if (bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ")
    // Get token from array
    const token = bearer[1]
    try {
      if (jwt.verify(token, process.env.JWT_SECRETKEY)) {
        // Set the token
        req.id = encodeToken(token).id
        // Next middleware
        next()
      } else {
        res.json({ auth: false })
      }
    } catch {
      res.json({ auth: false })
    }
  } else {
    // Forbidden
    res.json({ auth: false })
  }
}

// ACCOUNT SECTION --------------------------------------------------------------

const loginUser = async ({ username, password }, res) => {
  try {
    const users = await dbQuery(
      `SELECT * FROM users WHERE username = '${username}' LIMIT 1`
    )
    const userData = users[0]
    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      res.json({ message: "Incorrect username or password" })
    } else {
      createToken(userData.id, res)
    }
  } catch (err) {
    console.log(err)
    res.json({ message: "An error has occurred. Please try again" })
  }
}

const userRegistration = async ({ username, mail, password }, res) => {
  try {
    const resultMail = await dbQuery(
      `SELECT mail FROM users WHERE mail = '${mail}'`
    )
    if (resultMail.length < 1) {
      const hashedPassword = await bcrypt.hash(password, 4) //number of times the password is hashed
      dbQuery(
        `INSERT INTO users(username, password, mail) VALUES('${username}', '${hashedPassword}', '${mail}')`
      )
      loginUser({ username, password }, res)
    } else {
      res.render("registration", {
        message: "This mail is already in use, try another one",
        class: "alert-danger"
      })
    }
  } catch (err) {
    console.log(err)
    res.render("registration", {
      message: "An error has occurred. Please try again",
      class: "alert-danger"
    })
  }
}

// FILMS SECTION ----------------------------------------------------------------

const searchFilm = async (name) => {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(name)}&apikey=${
    process.env.OMDBKEY
  }`
  try {
    const response = await fetch(url)
    return response.json() //.json è una promise perciò c'è bisogno di await
  } catch (err) {
    console.log(err)
  }
}

const renderFilms = async (genre, res) => {
  try {
    const genreId = await dbQuery(
      "SELECT `id` FROM `genres` WHERE `name` = ? LIMIT 1",
      [genre]
    )

    const listOfTitlesID = await dbQuery(
      "SELECT `filmID` FROM `genreFilm` WHERE `genreID` = ?",
      [genreId[0].id]
    )

    const requests = listOfTitlesID.map(({ filmID }) =>
      dbQuery("SELECT title FROM `films` WHERE `id` = ? LIMIT 1", [filmID])
    )

    const listOfTitles = await Promise.all(requests)
    let listOfFilms = []
    let count = 0
    listOfTitles.forEach(async (film) => {
      // CERCA DI TRANSFORMARLO CON PROMISE.ALL
      const data = await searchFilm(film[0].title)

      const { Title, Plot, imdbRating, imdbVotes, imdbID, Genre, Poster } = data // riaggiungi il poster quando rifai Patreon
      // const usersVotes = await dbQuery(
      //   "SELECT `liked` FROM `votes` WHERE `filmID` = ?",
      //   [film[0].id]
      // )
      // const Appreciation = Math.floor(
      //   (usersVotes.reduce((sum, current) => sum + current.liked, 0) * 100) /
      //     usersVotes.length
      // )

      listOfFilms.push({
        Title,
        Plot,
        imdbRating,
        imdbVotes,
        imdbID,
        Genre,
        Poster
      })
      count++
      if (count === listOfTitles.length) {
        //utlizzo count poichè il foreach non so come metterlo asincrono e perciò se avessi
        listOfFilms.sort((a, b) => b.imdbRating - a.imdbRating) //film ordinati per voto decrescente./node_modules/.bin/eslint --init
        res.json({
          listOfFilms
        })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const voteFilm = async ({ title, rating }, userIDreq, res) => {
  try {
    const data = await searchFilm(title) //prendo i dati del film
    const genres = data.Genre.split(", ").filter(
      (genre) => !genre.includes("-") //creo una lista dei generi del film, escludendo quelli che hanno al loro interno "-" (sci-fi)
    )
    let titleID = await dbQuery(
      `SELECT films.id FROM films INNER JOIN votes ON films.id = votes.filmID AND userID = ${userIDreq} AND films.title = '${title}' LIMIT 1` //controllo se l'utente ha già votato quel film
    )
    if (titleID.length < 1) {
      //l'utente non ha già votato il film
      titleID = await dbQuery(
        `SELECT id FROM films WHERE title = '${title}' LIMIT 1` //controllo che il film non sia presente nella tabella genreFilm
      )
      if (!titleID.length) {
        await dbQuery(`INSERT INTO films (title) VALUES('${title}')`)
        titleID = await dbQuery(
          `SELECT id FROM films WHERE title = '${title}' LIMIT 1`
        )
        genres.forEach(async (genre) => {
          const genreID = await dbQuery(
            `SELECT id FROM genres WHERE name = '${genre}' LIMIT 1`
          )
          dbQuery(
            `INSERT INTO genreFilm VALUES(${titleID[0].id}, '${genreID[0].id}')`
          )
        })
      }

      dbQuery(
        `INSERT INTO votes VALUES(${titleID[0].id}, ${userIDreq}, ${rating})`
      )
    } else {
      dbQuery(
        `UPDATE votes SET liked = ${rating} WHERE filmID = ${titleID[0].id} AND userID = ${userIDreq}` //se l'utente ha già votato il film, il voto è aggiornato
      )
    }

    res.json({ auth: true, vote: true })
  } catch (err) {
    res.json({ auth: true, vote: false })
  }
}

// API SECTION -------------------------------------------------------------------------------

app.get("/genres", async (req, res) => {
  const results = await dbQuery("SELECT * FROM `genres`", [])
  res.json(results)
})

app.get("/films", (req, res) => {
  renderFilms(req.query.s, res)
})

app.get("/search", async (req, res) => {
  const response = await fetch(
    `https://www.omdbapi.com/?s=${encodeURIComponent(req.query.s)}&apikey=${
      process.env.OMDBKEY
    }`
  )
  const data = await response.json()
  if (data.Response) {
    res.json(data)
  } else res.json(data.Response)
})

app.get("/film/:title", async (req, res) => {
  const { title } = req.params
  try {
    const data = await searchFilm(title)
    res.json(data)
  } catch (err) {
    console.log(err)
  }
})

app.post("/login", (req, res) => {
  loginUser(req.body, res)
})

app.put("/vote", verifyToken, (req, res) => {
  voteFilm(req.body, req.id, res)
})

app.post("/token", verifyToken, async (req, res) => {
  try {
    const result = await dbQuery(
      `SELECT username FROM users WHERE id = '${req.id}' LIMIT 1`
    )
    const { username } = result[0]
    res.send({ username, auth: true })
  } catch {
    res.send({ auth: false })
  }
})

app.listen(3080)
