"use strict";

var searchButton = document.querySelector("#searchButton");
var searchFilm = document.querySelector("#searchFilm");
searchButton.addEventListener("click", function () {
  searchButton.href = "/search?title=".concat(searchFilm.value);
  searchFilm.value = "";
});