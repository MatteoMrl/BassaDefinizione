const path = require('path');
const express = require('express');
const hbs = require('hbs');
const request = require('request');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const atob = require('atob');
const app = express();
var count = 0; 
var fvCount = 0;
var userData;
var userFilms = []
var twFilms = []
var twList = []
var filmsNumber = 0;
dotenv.config({path: './private/.env'})

var db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
  });

const publicDirectoryPath = path.join(__dirname, 'public')
const viewsPath = path.join(__dirname, 'templates/views')
const partialsPath = path.join(__dirname, 'templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
// Setup static directory to serve
app.use(express.static(publicDirectoryPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

encodeToken = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(atob(base64));
  }

function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const token = bearer[1];
        if(jwt.verify(token, process.env.JWT_SECRETKEY)){
            // Set the token
            req.id = encodeToken(token).id;
            // Next middleware
            next()
        } else {
            res.render("error404")
        }
    } else {
      // Forbidden
      res.render("error404");
    }
  
  }

createToken = (id,res) => {
    const token = jwt.sign({id: id.toString()}, process.env.JWT_SECRETKEY, {expiresIn: process.env.JWT_EXPIRES_IN});
    const cookieOptions = {
        expires: new Date (
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        )
    }
    res.cookie('jwt', token, cookieOptions);
    renderFilms(twFilms,res);
}

registerUser = ({username, mail, password}, res) => {
    db.query(`SELECT mail FROM users WHERE mail = '${mail}'`, async (error,result) => {
        if(error){
            console.log(error);
        } else{
            if(result.length < 1){
                let hashedPassword = await bcrypt.hash(password, 4) //number of times the password is hashed
                db.query(`INSERT INTO users(username, password, mail) VALUES('${username}', '${hashedPassword}', '${mail}')`, (error,result) => {
                    if(error){
                        console.log(error);
                    } else {
                        res.render("registration", {message: "Account created successfully", class: "alert-success"})
                    }
                })
                
            } else {
                res.render("registration", {message: "This mail is already in use, try another one", class: "alert-danger"})
            }
        }
    })
}

loginUser = ({username, password}, res) => {
    db.query(`SELECT * FROM users WHERE username = '${username}'`, async (error, result) => {
        userData = result[0];
        if(!userData || !(await bcrypt.compare(password, userData.password))){
            res.render("login",{"message": "Incorrect username or password"})
        } else {
            createToken(userData.id, res);
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

renderFilms = (twFilms, res) => {
    db.query(`SELECT DISTINCT title FROM films ORDER BY rating DESC LIMIT 26;`, (error, result) => {
        filmsNumber = result.length-1; 
        result.forEach((value, index)=>{
            db.query(`SELECT AVG(rating) AS rating FROM bassad2.films WHERE title = '${value.title}'`, (error,result) => {
                searchFilm(value.title, (err, data) => {            
                    count++;
                    if(!err){
                        twFilms[index] = {imdbID: data.imdbID, title:data.Title, plot: data.Plot, rating: data.imdbRating, votes: data.imdbVotes, genre: data.Genre, poster: data.Poster, usersRating: result[0].rating.toFixed(1)}
                        if(count == (filmsNumber)){
                            res.render("index", {twFilms});
                            count = 0;
                            twFilms = [];
                        }
                    } else {                    
                        console.log("ERROR");
                        }
                    })
                })
            })
    })
}

voteFilm = (title, rating, userID, res) => {
    db.query(`SELECT userID FROM films WHERE title = '${title}' AND userID = '${userID}'`, (error, result) => {
        if(error){
            res.status(400).end();
        } else {
            if(result.length < 1){
                db.query(`INSERT INTO films VALUES('${title}', '${rating}', '${userID}')`, (error,result) => {
                    res.send({vote: true});
                })
            } else {
                res.send({vote: false});
            }
        }
    });
}

favoriteFilms = (userID, res)=> {
    db.query(`SELECT * FROM films WHERE userID = '${userID}' ORDER BY rating DESC`, (error, result) => {
        if(error){
            console.log(error);
        } else {
            if(result.length === 0){
                res.render("user");
            } else {
                result.forEach((value,index) => {
                    searchFilm(value.title, (err, data) => {
                        fvCount++;
                        userFilms[index] = {title:data.Title, rating: value.rating,poster: data.Poster}
                        if(fvCount == result.length){
                            res.render("user", {userFilms});
                            fvCount = 0;
                            userFilms = [];
                        }
                    })
                }) 
            }
        }       
    });
}

app.get('',(req, res) => {
    renderFilms(twFilms,res);
})

app.get('/user/:username', (req,res) => {
    renderFilms(twFilms,res);
})

app.post('/user/:username', (req, res) => {
    var username = req.params.username;
    db.query(`SELECT id FROM users WHERE username = '${username}'`, (error, result) => {
        if (error){
            console.log(error);
        } else {
            if(result.length === 1) {
                id = result[0].id;
                favoriteFilms(id,res);
            } else {
                res.end();
            }
        }
    })
});


app.get("/search",(req,res) => {
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

app.post("/login", (req,res) => {
    loginUser(req.body,res);
})

app.get("/registration", (req,res) => {
    res.render("registration");
})

app.post("/registration", (req, res) => {
    registerUser(req.body, res);
})

app.post("/token",verifyToken, (req,res) => {
    if(req.id !== undefined){
        db.query(`SELECT * FROM users WHERE id = '${req.id}'`, async (error, result) => {
            let userData = result[0];
            res.send({username: userData.username, id: userData.id});
        })
    } else {
        res.send();
    }
})

app.get("/vote", verifyToken,(req,res) => {
    const {film, rating} = req.query;
    voteFilm(film, rating, req.id, res);
})

app.get("*", (req,res)=> res.render("error404"))

.listen(80,()=>console.log("Listening on port 80..."))