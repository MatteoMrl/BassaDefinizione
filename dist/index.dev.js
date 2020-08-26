"use strict";

var path = require('path');

var express = require('express');

var hbs = require('hbs');

var app = express(); // Define paths for Express config

var publicDirectoryPath = path.join(__dirname, 'public');
var viewsPath = path.join(__dirname, 'templates/views');
var partialsPath = path.join(__dirname, 'templates/partials'); // Setup handlebars engine and views location

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath); // Setup static directory to serve

app.use(express["static"](publicDirectoryPath));
app.get('', function (req, res) {
  res.render("index");
}).listen(3000);