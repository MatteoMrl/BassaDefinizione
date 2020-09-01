const searchButton = document.querySelector("#searchButton");
const searchFilm = document.querySelector("#searchFilm");

searchButton.addEventListener("click", ()=>{
    searchButton.href=`/search?title=${searchFilm.value}`;
    searchFilm.value="";
})


