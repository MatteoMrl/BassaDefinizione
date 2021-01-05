const buttonChangeGenre = document.querySelector("#changeGenre");
const articleFilms = document.querySelector("#articleFilms");
const articleGenres = document.querySelector("#articleGenres");
const titleGenre = document.querySelector("#currentGenre");
const currentGenre = titleGenre.innerHTML;
buttonChangeGenre.addEventListener("click", () => {
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
