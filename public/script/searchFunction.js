const searchButton = document.querySelector("#searchButton");
    const searchFilm = document.querySelector("#searchFilm");
    console.log(searchButton);
    searchButton.addEventListener("click", ()=>{
        searchButton.href=`/search?title=${searchFilm.value}`;
        searchFilm.value="";
    })