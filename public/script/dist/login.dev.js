"use strict";

var usernameInput = document.querySelector("#username");
var passwordInput = document.querySelector("#password");
var button = document.querySelector("button");
var html = document.querySelector("html");
var logo = document.querySelector("#imgLogo");
var validUsername = false;
var validPassword = false;
button.disabled = true;

if (localStorage.getItem("mode")) {
  if (localStorage.getItem("mode") === "light") {
    html.setAttribute("data-theme", "light");
    logo.setAttribute("src", "/img/lgLogo.jpg");
  } else {
    html.setAttribute("data-theme", "dark");
    logo.setAttribute("src", "/img/dkLogo.jpg");
  }
} else {
  localStorage.setItem("mode", "dark");
}

function checkUsername() {
  var regex = /^(?=.{3,14}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;

  if (usernameInput.value.match(regex)) {
    validUsername = true;
    usernameInput.classList.remove("invalid");
    usernameInput.classList.add("valid");
  } else {
    validUsername = false;
    usernameInput.classList.remove("valid");
    usernameInput.classList.add("invalid");
  }
}

function checkPassword() {
  var regex = /^[A-Za-z]\w{5,13}$/;

  if (passwordInput.value.match(regex)) {
    validPassword = true;
    passwordInput.classList.remove("invalid");
    passwordInput.classList.add("valid");
  } else {
    validPassword = false;
    passwordInput.classList.remove("valid");
    passwordInput.classList.add("invalid");
  }
}

function validButton() {
  if (validUsername === true && validPassword === true) {
    button.disabled = false;
    button.style.backgroundColor = "white";
  } else {
    button.disabled = true;
    button.style.backgroundColor = "red";
  }
}

usernameInput.addEventListener("keydown", function () {
  checkUsername();
  validButton();
});
usernameInput.addEventListener("change", function () {
  checkUsername();
  validButton();
});
passwordInput.addEventListener("keydown", function () {
  checkPassword();
  validButton();
});
passwordInput.addEventListener("change", function () {
  checkPassword(passwordInput.value);
  validButton();
});
button.addEventListener("mouseover", function () {
  button.style.backgroundColor = "green";
});
button.addEventListener("mouseout", function () {
  button.style.backgroundColor = "white";
});
button.addEventListener("click", function () {
  fetch("/login", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + token
    },
    method: "POST",
    body: "username=".concat(usernameInput.value, "&password=").concat(passwordInput.value)
  });
});