import React, { useRef } from "react"

const Catalog = ({
  films,
  currentGenre,
  genres,
  setCurrentGenre,
  isRendered,
  setIsRendered
}) => {
  const changeGenreButton = useRef()
  const articleFilms = useRef()
  const articleGenres = useRef()
  const titleGenre = useRef()

  const changeMode = () => {
    if (articleFilms.current.style.display !== "none") {
      articleFilms.current.style.display = "none"
      articleGenres.current.style.display = "grid"
      titleGenre.current.innerHTML = "Choose the genre"
    } else {
      articleFilms.current.style.display = "grid"
      articleGenres.current.style.display = "none"
      titleGenre.current.innerHTML = currentGenre
    }
  }

  const SectionFilms = () => {
    if (isRendered) {
      return (
        <article id="articleFilms" ref={articleFilms}>
          {films.map((film) => {
            return (
              <li className="card" key={film.imdbID}>
                <a href={`/film/${film.Title}`}>
                  <img
                    className="card-img-top"
                    src={film.Poster}
                    alt="Cardcap"
                  />
                </a>
                <div className="card-body">
                  <h5 className="card-title">{film.Title}</h5>
                  <p className="card-text" id="plot">
                    {film.Plot}
                  </p>
                  <h6 className="card-label">GENRE</h6>
                  <p className="card-text" id="filmGenre">
                    {film.Genre}
                  </p>
                  <h6 className="card-label">IMDB RATING</h6>
                  <p className="card-text">
                    {film.imdbRating}
                    <i className="far fa-star"></i> | {film.imdbVotes}{" "}
                    <i className="fas fa-vote-yea"></i>
                  </p>
                </div>
              </li>
            )
          })}
        </article>
      )
    } else {
      return (
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )
    }
  }

  return (
    <section>
      <div className="module-border-wrap">
        <div id="slogan">
          <img src="/img/logo.jpg" alt="logo" />
          <h2>Search. Vote. Save.</h2>
          <h1>ANY MOVIE IN YOUR MIND</h1>
        </div>
      </div>
      <div className="genre" id={currentGenre}>
        <h1 id="currentGenre" ref={titleGenre}>
          {currentGenre}
        </h1>
        <i
          id="changeGenre"
          ref={changeGenreButton}
          onClick={changeMode}
          className="fas fa-exchange-alt"
        ></i>
      </div>

      <SectionFilms />

      <article id="articleGenres" ref={articleGenres}>
        <ul>
          {genres
            .filter((genre) => genre.name !== currentGenre)
            .map((genre) => {
              return (
                <li
                  key={genre.id}
                  onClick={(e) => {
                    setCurrentGenre(e.target.innerText)
                    setIsRendered(false)
                    changeMode()
                  }}
                >
                  <span>
                    <span>
                      <span>{genre.name}</span>
                    </span>
                  </span>
                </li>
              )
            })}
        </ul>
      </article>
    </section>
  )
}

export default Catalog
