const stars = document.querySelectorAll(".fa-star");
const rating = document.querySelector("#starRating");
const filmName = document.querySelector("#title").innerHTML;
const userRating = document.querySelector("#rating");
const message = document.querySelector("#message");
let starRating = 1;

stars.forEach((value, index) => {
  value.addEventListener("mouseover", () => {
    for (i = 2; i < stars.length; i++) {
      //così è impossibile dar meno di 1 stella
      stars[i].classList.add("far");
      stars[i].classList.remove("fas");
    }
    for (i = 1; i <= index; i++) {
      userRating.innerHTML = index + "/10";
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
        message.style.color = "green";
        if (vote) {
          message.innerHTML =
            "<i class='far fa-check-circle'></i> FILM RATED CORRECTLY";
        } else {
          message.innerHTML =
            "<i class='far fa-check-circle'></i> RATING UPDATED SUCCESSFULLY";
        }
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
