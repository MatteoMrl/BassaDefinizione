const path = require('path')
const express = require('express')
const hbs = require('hbs')
const request = require('request');
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const app = express()
var count = 0; 
var toWatch = false;
dotenv.config({path: './private/.env'})

var db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
  });

const twFilms = [{ name: "Breaking Bad"},{ name: "Game of thrones"},{ name: "Interstellar"},{ name: "titanic"},{ name: "It"},{ name: "American gods"},{name: "The simpsons"}, {name: "futurama"}, {name: "The martian"}, {name: "8 mile"}];

const publicDirectoryPath = path.join(__dirname, 'public')
const viewsPath = path.join(__dirname, 'templates/views')
const partialsPath = path.join(__dirname, 'templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

checkUser = ({username, mail, password}, res) => {
    db.query(`SELECT mail FROM users WHERE mail = '${mail}'`, async (error,result) => {
        if(error){
            console.log(error);
        } else{
            if(result.length == 0){
                let hashedPassword = await bcrypt.hash(password, 4) //number of times the password is hashed
                db.query(`INSERT INTO users(username, password, mail) VALUES('${username}', '${hashedPassword}', '${mail}')`, (error,result) => {
                    if(error){
                        console.log(error);
                    } else {
                        console.log("CE L'HAI FATTA BRUTTO FIGLIO DI PUTTANA!");
                        res.render("registration", {message: "Account created successfully", class: "alert-success"})
                    }
                })
                
            } else {
                res.render("registration", {message: "This mail is already in use, try another one", class: "alert-danger"})
            }
        }
    })
}

searchFilm = (name, callback) =>{
    let url = `https://www.omdbapi.com/?t=${encodeURIComponent(name)}&apikey=${process.env.OMDBKEY}`;
    request(url, function(error, res, body){
        if(!error && res.statusCode == 200){
            var dataFilm = JSON.parse(body)
            return callback(undefined,dataFilm);
        }
        else{return callback("error", dataFilm)}
    });
}

app.get('', (req, res) => {
    if(toWatch == false){
        twFilms.forEach((value, index)=>{
            searchFilm(value.name, (err, data) => {
                count++;
                if(!err){
                    twFilms[index] = {imdbID: data.imdbID, title:data.Title, plot: data.Plot, rating: data.imdbRating, votes: data.imdbVotes, genre: data.Genre, poster: data.Poster}
                    if(count == twFilms.length){
                        toWatch = true;
                        res.render("index", {twFilms});
                    }
                } else {
                    console.log("ERROR");
                }
            })
        })
    } else {
        res.render("index", {twFilms});
    }
})

app.get("/search", (req,res) => {
    const title=req.query.title;
    if(title!==undefined){
        searchFilm(title,(err, data) => {
            if(!err){
                if(data.Director==="N/A"){
                    data.Director=undefined;
                }
                res.render("searchFilms", {data});
            } else {
                console.log("ERROR");
            }
        })
    }else{
        res.render("searchFilms")
    }
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.get("/registration", (req,res) => {
    res.render("registration");
})

app.post("/registration", function (req, res) {
    checkUser(req.body, res);
})

.listen(3000,()=>console.log("Listening on port 3000..."))