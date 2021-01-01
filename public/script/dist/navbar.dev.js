"use strict";
"use script";

var form = document.querySelector("#userForm");
var userButton = document.querySelector("#userButton");
var loginButton = document.querySelector("#loginButton");
var signinButton = document.querySelector("#signinButton");
var logoutButton = document.querySelector("#logoutButton");
var modeButton = document.querySelector("#modeButton");
var html = document.querySelector("html");
var currentMode = html.getAttribute("data-theme");
var logo = document.querySelector("#logo");
var userInteraction = document.querySelector("#userInteraction");
var dropdownContent = document.querySelector("#dropdown-content");

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
}

getStorage = function getStorage() {
  if (localStorage.getItem("mode")) {
    if (localStorage.getItem("mode") === "light") {
      html.setAttribute("data-theme", "light");
      logo.setAttribute("src", "/img/lgLogo.jpg");
      modeButton.innerHTML = "<i class='far fa-sun' id='modeButton'></i> LIGHT MODE";
      currentMode = "light";
    } else {
      html.setAttribute("data-theme", "dark");
      logo.setAttribute("src", "/img/dkLogo.jpg");
      modeButton.innerHTML = "<i class='far fa-moon' id='modeButton'></i> DARK MODE";
      currentMode = "dark";
    }
  } else {
    localStorage.setItem("mode", "dark");
  }
};

getStorage();
var token = getCookie("jwt");

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
    var id = data.id;
    var username = data.username;

    if (username) {
      form.action = "/user/".concat(username);
      userButton.style.display = "block";
      userButton.innerHTML = "<i class=\"fa fa-user icon\"></i> ".concat(username);
      logoutButton.style.display = "block";
    }
  })["catch"](function (err) {
    console.log("Something went wrong!", err);
  });
} else {
  loginButton.style.display = "block";
  signinButton.style.display = "block";
}

logoutButton.addEventListener("click", function () {
  document.cookie = "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});
modeButton.addEventListener("mouseover", function () {
  modeButton.innerHTML = "<i class='fas fa-exchange-alt'></i> CHANGE";
});
modeButton.addEventListener("mouseout", function () {
  if (currentMode === "dark") {
    modeButton.innerHTML = "<i class='far fa-moon' id='modeButton'></i> DARK MODE";
  } else {
    modeButton.innerHTML = "<i class='far fa-sun' id='modeButton'></i> LIGHT MODE";
  }
});
modeButton.addEventListener("click", function () {
  if (currentMode === "dark") {
    html.setAttribute("data-theme", "light");
    logo.setAttribute("src", "/img/lgLogo.jpg");
    modeButton.innerHTML = "<i class='far fa-sun' id='modeButton'></i> LIGHT MODE";
    currentMode = "light";
    localStorage.setItem("mode", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    logo.setAttribute("src", "/img/dkLogo.jpg");
    modeButton.innerHTML = "<i class='far fa-moon' id='modeButton'></i> DARK MODE";
    currentMode = "dark";
    localStorage.setItem("mode", "dark");
  }
});
userInteraction.addEventListener("click", function () {
  if (dropdownContent.style.display === "none" || !dropdownContent.style.display) dropdownContent.style.display = "block";else dropdownContent.style.display = "none";
});