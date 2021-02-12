'use strict'
const path = require('path')
const express = require('express')
const hbs = require('hbs')
const fetch = require('node-fetch')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const atob = require('atob')
const { title } = require('process')
const app = express()
let fvCount = 0
let userData
let listOfGenres = []
dotenv.config({ path: './private/.env' })

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

const publicDirectoryPath = path.join(__dirname, 'public')
const viewsPath = path.join(__dirname, 'templates/views')
const partialsPath = path.join(__dirname, 'templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

//-----------------------------------------------------------------------------------------------

const dbQuery = (queryString) => {
  return new Promise((resolve) => {
    db.query(queryString, (error, result) => {
      if (error) {
        throw error
      } else {
        resolve(result)
      }
    })
  })
}

function encodeToken(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace('-', '+').replace('_', '/')
  return JSON.parse(atob(base64))
}

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization']
  // Check if bearer is undefined
  if (bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ')
    // Get token from array
    const token = bearer[1]
    if (jwt.verify(token, process.env.JWT_SECRETKEY)) {
      // Set the token
      req.id = encodeToken(token).id
      // Next middleware
      next()
    } else {
      res.render('error404')
    }
  } else {
    // Forbidden
    res.render('error404')
  }
}

function createToken(id, res) {
  const token = jwt.sign({ id: id.toString() }, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  }
  res.cookie('jwt', token, cookieOptions)
  renderFilms(null, res)
}

const loginUser = async ({ username, password }, res) => {
  try {
    const users = await dbQuery(
      `SELECT * FROM users WHERE username = '${username}'`
    )
    userData = users[0]
    if (!userData || !(await bcrypt.compare(password, userData.password))) {
      res.render('login', { message: 'Incorrect username or password' })
    } else {
      createToken(userData.id, res)
    }
  } catch (err) {
    console.log(err)
    res.render('login', { message: 'An error has occurred. Please try again' })
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
      res.render('registration', {
        message: 'This mail is already in use, try another one',
        class: 'alert-danger'
      })
    }
  } catch (err) {
    console.log(err)
    res.render('registration', {
      message: 'An error has occurred. Please try again',
      class: 'alert-danger'
    })
  }
}

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
  if (!genre) {
    genre = 'Action'
  }
  try {
    const genreId = await dbQuery(
      `SELECT id FROM genres WHERE genres.name = '${genre}'`
    )
    const listOfTitlesID = await dbQuery(
      `SELECT filmID
      FROM genreFilm
      WHERE genreID = ${genreId[0].id}`
    )

    const requests = listOfTitlesID.map(({ filmID }) =>
      dbQuery(`SELECT * FROM films WHERE id = ${filmID}`)
    )

    const listOfTitles = await Promise.all(requests)

    let listOfFilms = []
    let count = 0
    listOfTitles.forEach(async (film) => {
      // CERCA DI TRANSFORMARLO CON PROMISE.ALL
      const data = await searchFilm(film[0].title)
      const { Title, Plot, imdbRating, imdbVotes, Genre, Poster } = data // riaggiungi il poster quando rifai Patreon
      const usersVotes = await dbQuery(
        `SELECT liked FROM votes WHERE filmID = '${film[0].id}'`
      )
      const Appreciation = Math.floor(
        (usersVotes.reduce((sum, current) => sum + current.liked, 0) * 100) /
          usersVotes.length
      )
      listOfFilms.push({
        Title,
        Plot,
        Rating: imdbRating,
        Votes: imdbVotes,
        Appreciation,
        Genre,
        Poster
      })
      count++
      if (count === listOfTitles.length) {
        //utlizzo count poichè il foreach non so come metterlo asincrono e perciò se avessi
        listOfFilms.sort((a, b) => b.Rating - a.Rating) //film ordinati per voto decrescente./node_modules/.bin/eslint --init
        res.render('index', {
          genre,
          listOfFilms,
          listOfGenres
        })
      }
    })
  } catch (err) {
    console.log(err)
  }
}

const voteFilm = async (title, vote, userIDreq, res) => {
  try {
    const data = await searchFilm(title) //prendo i dati del film
    const genres = data.Genre.split(', ').filter(
      (genre) => !genre.includes('-') //creo una lista dei generi del film, escludendo quelli che hanno al loro interno "-" (sci-fi)
    )
    let titleID = await dbQuery(
      `SELECT films.id FROM films INNER JOIN votes ON films.id = votes.filmID AND userID = ${userIDreq} AND films.title = '${title}'` //controllo se l'utente ha già votato quel film
    )
    if (titleID.length < 1) {
      //l'utente non ha già votato il film
      titleID = await dbQuery(
        `SELECT id FROM films WHERE title = '${title}'` //controllo che il film non sia presente nella tabella genreFilm
      )
      if (!titleID.length) {
        await dbQuery(`INSERT INTO films (title) VALUES('${title}')`)
        titleID = await dbQuery(`SELECT id FROM films WHERE title = '${title}'`)
        genres.forEach(async (genre) => {
          const genreID = await dbQuery(
            `SELECT id FROM genres WHERE name = '${genre}'`
          )
          dbQuery(
            `INSERT INTO genreFilm VALUES(${titleID[0].id}, '${genreID[0].id}')`
          )
        })
      }

      dbQuery(
        `INSERT INTO votes VALUES(${titleID[0].id}, ${userIDreq}, ${vote})`
      )
    } else {
      db.query(
        `UPDATE votes SET liked = ${vote} WHERE filmID = ${titleID[0].id} AND userID = ${userIDreq}` //se l'utente ha già votato il film, il voto è aggiornato
      )
    }

    res.send({ vote: true })
  } catch (err) {
    console.log(err)
  }
}

const favoriteFilms = async (userID, res) => {
  //prende tutti i film votati piaciuti all'utente e li renderizza --> pesante ma evito altre chiamate
  let userFilms = []
  let userGenres = listOfGenres //copio la lista dei generi globale in modo da poterla modificare in base all'utente
  let filterUserGenres = []

  try {
    let results = await dbQuery(
      `SELECT DISTINCT films.title, votes.liked
      FROM films
      INNER JOIN votes ON films.id = votes.filmID AND votes.userID = ${userID}`
    )
    //se sono presenti 1 o + film votati dall'utente in quel genere allora li scorre
    results = results.map(({ title }) => searchFilm(title)) //la lista dei risultati diventa una di promise (searchFilm è una promise avendo async)
    const allData = await Promise.all(results) //stesso procedimento di results
    for (let data of allData) {
      //se nella lista dei film dell'utente non è presente quello appena cercato lo aggiunge
      //questo viene fatto per evitare che film con più generi vengano aggiunti più volte
      const { Title, imdbRating, Poster, Genre } = data
      Genre.split(', ')
        .filter(
          (genre) => !genre.includes('-') //creo una lista dei generi del film, escludendo quelli che hanno al loro interno "-" (sci-fi)
        )
        .forEach((genre) => {
          if (!filterUserGenres.includes(genre)) filterUserGenres.push(genre)
        })

      userFilms.push({ Title, imdbRating, Poster, Genre })
    }
    res.render('user', {
      userFilms,
      userGenres: filterUserGenres
    })
  } catch (err) {
    console.log(err)
  }
}

const renderUser = async ({ username }, res) => {
  try {
    const result = await dbQuery(
      `SELECT id FROM users WHERE username = '${username}'`
    )
    if (result.length === 1) {
      const id = result[0].id
      favoriteFilms(id, res)
    } else {
      throw new Error('id not found')
    }
  } catch (err) {
    console.log(err)
  }
}

//----------------------------------------------------------------------------------------------------

;(async () => {
  listOfGenres = await dbQuery('SELECT * FROM genres')
})()

//-----------------------------------------------------------------------------------------------------

app.get('', (req, res) => {
  renderFilms(req.query.genre, res)
})

app.get('/user/:username', (req, res) => {
  res.render('index', { allFilms })
})

app.post('/user/:username', (req, res) => {
  renderUser(req.params, res)
})

app.get('/search', async (req, res) => {
  const title = req.query.title
  if (title) {
    try {
      const data = await searchFilm(title)
      if (data.Director === 'N/A') {
        data.Director = undefined
      }
      res.render('searchFilms', { data })
    } catch (err) {
      console.log(err)
    }
  } else {
    res.render('searchFilms')
  }
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  loginUser(req.body, res)
})

app.get('/registration', (req, res) => {
  res.render('registration')
})

app.post('/registration', (req, res) => {
  userRegistration(req.body, res)
})

app.post('/token', verifyToken, async (req, res) => {
  if (req.id !== undefined) {
    try {
      const result = await dbQuery(`SELECT * FROM users WHERE id = '${req.id}'`)
      const userData = result[0]
      res.send({ username: userData.username, id: userData.id })
    } catch {
      res.send({ username: undefined })
    }
  } else {
    res.send({ username: undefined })
  }
})

app.get('/vote', verifyToken, (req, res) => {
  const { film, vote } = req.query
  voteFilm(film, vote, req.id, res)
})

app.get('/logout', (req, res) => {
  renderFilms(null, res)
})

app
  .get('*', (req, res) => res.status(404).render('error404'))

  .listen(80, () => console.log('Listening on port 80...'))
