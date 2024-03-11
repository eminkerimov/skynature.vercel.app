import React, { useEffect, useState } from 'react'
import "./MainNews.scss"
import SingleMainNews from './SingleMainNews'
import useFetch from "../../custom/useFetch"

const MainNews = () => {
  const [newsCount, setNewsCount] = useState(9)
  const [dataNews, setDataNews] = useState([])

  const {data, loading, error} = useFetch();

  useEffect(() => {
    if(data){
      setDataNews(data?.hits)
    }
  }, [data])
  

  const moreNews = (prev) => {
    setNewsCount(prev + 9)
  }

  return (
    <section className="mainnews">
    <div className="container">
      <div className="row">
        {dataNews?.slice(0, newsCount)?.map((news, index)=>(
        <SingleMainNews
          news={news}
          index={index}
          key={news?.id}
        />
        ))}
      </div>
      <div v-if="newsCount < dataNews.length" className="row">
        <div className="col-12">
          <div className="mainnews-more">
            <button onClick={moreNews}>Load More</button>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

export default MainNews