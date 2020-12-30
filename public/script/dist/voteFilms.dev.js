"use strict";

var thumbsUp = document.querySelector(".fa-thumbs-up");
var thumbsDown = document.querySelector(".fa-thumbs-down");
var filmName = document.querySelector("#title").innerHTML;
var vote = document.querySelector("#vote");
var serverResponse = document.querySelector("#serverResponse"); //cerca di mettere i due casi in una unica funzione

var sendVote = function sendVote(rating) {
  fetch("/vote?film=".concat(encodeURIComponent(filmName), "&vote=").concat(rating), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token
    },
    method: "GET"
  }).then(function (response) {
    return response.json();
  }).then(function (_ref) {
    var vote = _ref.vote;

    if (vote) {
      serverResponse.innerHTML = "<i class='far fa-check-circle'></i>";
    } else {
      serverResponse.innerHTML = "<i class='far fa-times-circle'></i>";
    }

    serverResponse.style.backgroundColor = "green";
  });
};

thumbsUp.addEventListener("click", function () {
  return sendVote(1);
});
thumbsDown.addEventListener("click", function () {
  return sendVote(0);
});

if (token !== "") {
  fetch("/token", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token
    },
    method: "POST"
  }).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data.username) {
      vote.style.display = "block";
    } else {
      vote.style.display = "none";
    }
  });
} else {
  vote.style.display = "none";
}