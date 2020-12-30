const genres = document.querySelectorAll("li");
console.log({{genre}})
genres.forEach((genre) => {
  genre.addEventListener("click", () => {
    fetch(`?genre=${genre.id}`);
  });
});
