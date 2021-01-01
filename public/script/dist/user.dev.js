"use strict";

var userGenres = document.querySelectorAll("li");
var cards = document.querySelectorAll(".card");
userGenres.forEach(function (liGenre) {
  liGenre.addEventListener("click", function () {
    cards.forEach(function (card) {
      card.style.display = "block";
      if (!card.id.includes(liGenre.id)) card.style.display = "none";
    });
  });
});