const userGenres = document.querySelectorAll("li");
const cards = document.querySelectorAll(".card");
userGenres.forEach((liGenre) => {
  liGenre.addEventListener("click", () => {
    cards.forEach((card) => {
      card.style.display = "block";
      if (!card.id.includes(liGenre.id)) card.style.display = "none";
    });
  });
});
