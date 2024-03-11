import React from 'react'
import SingleTopNews from './SingleTopNews'
import "./TopNews.scss"
import useFetch from "../../custom/useFetch"

const TopNews = () => {
  const {data, loading, error} = useFetch();
  
  return (
    <section className="topnews">
    <div className="container">
      <div className="row">
        {data?.hits?.slice(0,4)?.map((news) => (
        <SingleTopNews news={news} key={news?.id} />
        ))}
      </div>
    </div>
  </section>
  )
}

export default TopNews