"use strict";

var buttonChangeGenre = document.querySelector("#changeGenre");
var articleFilms = document.querySelector("#articleFilms");
var articleGenres = document.querySelector("#articleGenres");
var titleGenre = document.querySelector("#currentGenre");
var currentGenre = titleGenre.innerHTML;
buttonChangeGenre.addEventListener("click", function () {
  if (articleFilms.style.display !== "none") {
    articleFilms.style.display = "none";
    articleGenres.style.display = "grid";
    titleGenre.innerHTML = "Choose the genre";
  } else {
    articleFilms.style.display = "grid";
    articleGenres.style.display = "none";
    titleGenre.innerHTML = currentGenre;
  }
});