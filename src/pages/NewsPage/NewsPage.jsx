import React from "react";
import "./NewsPage.scss";
import SingleNewsPage from "./SingleNewsPage";
import MainNews from "../../components/MainNews/MainNews";
import { useParams } from "react-router-dom";
import useFetch from "../../custom/useFetch"

const NewsPage = () => {
  const {id} = useParams();
  const {data, loading, error} = useFetch();

  let result = data?.hits?.filter((item) => {
    return item?.id == id;
});

  return (
    <div className="container">
    <SingleNewsPage result={result?.[0]} title={id} />
    <div className="row">
      <div className="col-12">
        <h2 className="oxshar">Related News</h2>
      </div>
    </div>
    <MainNews />
  </div>
  );
};

export default NewsPage;
