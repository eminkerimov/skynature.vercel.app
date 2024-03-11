import React from "react";
import {Link} from "react-router-dom";

const SingleMainNews = ({ news, index }) => {
  return (
    <Link to={`/news/${news?.id}`} className="col-4">
    {!(index % 5 == 0 && index != 0) ? (
      <a href="#">
        <div className="mainnews-item">
          <div className="mainnews-item_img">
            <img src={news?.largeImageURL} alt={news?.title} />
          </div>
          <div className="mainnews-item_content">
            <p>{news?.user}</p>
            <h3>{news?.tags}</h3>
            <div className="mainnews-item_content_bottom">
              <span>
                <i className="fas fa-user-edit"></i>
                {news?.user}
              </span>
              <span>
                <i className="fas fa-comment-alt"></i>
                {news?.comments}
              </span>
              <span>
                <i className="fas fa-clock"></i>
                {news?.likes}
              </span>
            </div>
          </div>
        </div>
      </a>
    ) : (
      <a href="#">
        <div className="mainnews-item">
          <div className="adv-panel small">
            <h2>SKY NATURE</h2>
          </div>
        </div>
      </a>
    )}
  </Link>
  );
};

export default SingleMainNews;
