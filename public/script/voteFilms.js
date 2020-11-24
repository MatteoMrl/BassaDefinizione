"use strict";
const rating = document.querySelector("#starRating");
const stars = rating.querySelectorAll(".fa-star");
const filmName = document.querySelector("#title").innerHTML;
const userRating = document.querySelector("#rating");
const serverResponse = document.querySelector("#serverResponse");
let starRating = 1;

stars.forEach((value, index) => {
  value.addEventListener("mouseover", () => {
    for (let i = 0; i < stars.length; i++) {
      //così è impossibile dar meno di 1 stella
      stars[i].classList.add("far");
      stars[i].classList.remove("fas");
    }
    for (let i = 0; i <= index; i++) {
      userRating.innerHTML = index + 1 + " <i class='far fa-star'></i>";
      stars[i].classList.add("fas");
      stars[i].classList.remove("far");
    }
  });
  value.addEventListener("click", () => {
    fetch(`/vote?film=${encodeURIComponent(filmName)}&rating=${index}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + token,
      },
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then(({ vote }) => {
        if (vote) {
          serverResponse.innerHTML =
            "<i class='far fa-check-circle'></i> RATED";
        } else {
          serverResponse.innerHTML =
            "<i class='far fa-check-circle'></i> UPDATED";
        }
        serverResponse.style.backgroundColor = "green";
      });
  });
});
if (token !== "") {
  fetch("/token", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token,
    },
    method: "POST",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.username) {
        rating.style.display = "block";
      } else {
        rating.style.display = "none";
      }
    });
} else {
  rating.style.display = "none";
}
