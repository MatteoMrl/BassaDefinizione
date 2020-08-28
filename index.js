const path = require('path')
const express = require('express')
const hbs = require('hbs')
var request = require('request');
const app = express()
var count = 0; 
var toWatch = false;
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json())
const twFilms = [{ name: "Breaking Bad"},{ name: "Game of thrones"},{ name: "Interstellar"},{ name: "titanic"},{ name: "It"},{ name: "American gods"},{name: "The simpsons"}, {name: "futurama"}, {name: "The martian"}, {name: "8 mile"}];

searchFilm = (name, callback) =>{
    let url = `https://www.omdbapi.com/?t=${encodeURIComponent(name)}&apikey=e3e69745`;
    request(url, function(error, res, body){
        if(!error && res.statusCode == 200){
            var dataFilm = JSON.parse(body)
            return callback(undefined,dataFilm);
        }
        else{return callback("error", dataFilm)}
    });
}

const publicDirectoryPath = path.join(__dirname, 'public')
const viewsPath = path.join(__dirname, 'templates/views')
const partialsPath = path.join(__dirname, 'templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    if(toWatch == false){
        twFilms.forEach((value, index)=>{
            searchFilm(value.name, (err, data) => {
                count++;
                if(!err){
                    twFilms[index] = {imdbID: data.imdbID, title:data.Title, plot: data.Plot, rating: data.imdbRating, votes: data.imdbVotes, genre: data.Genre}
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
    if(title!==""){
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
    }
})

.listen(3000,()=>console.log("Listening on port 3000..."))