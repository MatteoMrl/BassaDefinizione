const express = require("express")
const path = require("path")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const fetch = require("node-fetch")
let listOfGenres = []

const publicDirectoryPath = path.join(__dirname, "public")
app.use(express.static(publicDirectoryPath))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

dotenv.config({ path: "./private/.env" })

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

//--------------------------------------------------------------------------------

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
      "SELECT `id` FROM `genres` WHERE `name` = ?",
      [genre]
    )

    const listOfTitlesID = await dbQuery(
      "SELECT `filmID` FROM `genreFilm` WHERE `genreID` = ?",
      [genreId[0].id]
    )

    const requests = listOfTitlesID.map(({ filmID }) =>
      dbQuery("SELECT * FROM `films` WHERE `id` = ?", [filmID])
    )

    const listOfTitles = await Promise.all(requests)

    let listOfFilms = []
    let count = 0
    listOfTitles.forEach(async (film) => {
      // CERCA DI TRANSFORMARLO CON PROMISE.ALL
      const data = await searchFilm(film[0].title)

      const { Title, Plot, imdbRating, imdbVotes, imdbID, Genre, Poster } = data // riaggiungi il poster quando rifai Patreon
      const usersVotes = await dbQuery(
        "SELECT `liked` FROM `votes` WHERE `filmID` = ?",
        [film[0].id]
      )
      const Appreciation = Math.floor(
        (usersVotes.reduce((sum, current) => sum + current.liked, 0) * 100) /
          usersVotes.length
      )

      listOfFilms.push({
        Title,
        Plot,
        imdbRating,
        imdbVotes,
        Appreciation,
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

//-------------------------------------------------------------------------------

;(async () => {
  listOfGenres = await dbQuery("SELECT * FROM genres", [])
})()

//-------------------------------------------------------------------------------

// viewed at http://localhost:8080
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

app.listen(3080)
