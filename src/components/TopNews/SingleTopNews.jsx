import React from 'react'
import {Link} from "react-router-dom";

const SingleTopNews = ({news}) => {
  return (
    <Link to={`/news/${news?.id}`} className="col-3">
    <a href="#">
      <div className="topnews-item">
        <div className="topnews-item-img">
          <img src={news?.largeImageURL} alt="news.title" />
        </div>
        <div className="topnews-item-content">
          <h3>{news?.user}</h3>
          <p>{news?.tags}</p>
        </div>
      </div>
    </a>
  </Link>
  )
}

export default SingleTopNews