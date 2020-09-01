"use strict";

var stars = document.querySelectorAll(".fa-star");
var starRating = 1;
stars.forEach(function (value, index) {
  value.addEventListener("mouseover", function () {
    for (i = 2; i < stars.length; i++) {
      //così è impossibile dar meno di 1 stella
      stars[i].classList.add("far");
      stars[i].classList.remove("fas");
    }

    for (i = 1; i <= index; i++) {
      stars[i].classList.add("fas");
      stars[i].classList.remove("far");
    }
  });
  value.addEventListener("click", function () {
    starRating = index;
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        console.log("bellooooo");
      }
    };

    xhttp.open("GET", "/vote", true);
    xhttp.send();
  });
});