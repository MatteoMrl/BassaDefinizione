import fetch from "node-fetch"
import React, { useEffect, useState } from "react"
import "../css/searchFilm.css"

const SearchedFilm = (props) => {
  const [data, setData] = useState()
  const [isRendered, setIsRendered] = useState(false)
  useEffect(() => {
    const url = encodeURI(`/film/${props.match.params.title}`)
    fetch(url)
      .then((res) => res.json())
      .then((film) => {
        setData(film)
        setIsRendered(true)
      })
  }, [])

  if (isRendered) {
    return (
      <React.Fragment>
        {data !== undefined ? (
          <section id="specificFilm">
            <img src={data.Poster} alt="" />
            <div id="filmInformation">
              <h1 id="title">{data.Title}</h1>
              <h5 id="plot">{data.Plot}</h5>
              <h5 id="genre">{data.Genre}</h5>
              <h5 id="runtime">{data.Runtime}</h5>
              <h5 id="released">{data.Released}</h5>
              <h5 id="director">Director: {data.Director}</h5>
              <h5 id="actors">Actors: {data.Actors}</h5>
              <h5 id="awards">{data.Awards}</h5>
              <h5 id="imdbRating">
                {data.imdbRating} <i className="far fa-star"></i> |{" "}
                {data.imdbVotes} <i className="fas fa-vote-yea"></i> IMDb
                ratings
              </h5>
              <div id="vote">
                <h5 id="textRating">Rate the film</h5>
                <i className="fas fa-thumbs-up"></i>
                <i className="fas fa-thumbs-down"></i>
                <h6 id="serverResponse"></h6>
              </div>
            </div>
          </section>
        ) : (
          <div id="filmNotFound">
            <h1>
              FILM <span>NOT FOUND</span> TRY ANOTHER NAME
            </h1>
          </div>
        )}
      </React.Fragment>
    )
  } else {
    return (
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    )
  }
}

export default SearchedFilm
