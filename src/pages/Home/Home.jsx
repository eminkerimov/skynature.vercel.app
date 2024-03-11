import React from "react";
import Adv from "../../components/Adv/Adv";
import TopNews from "../../components/TopNews/TopNews";
import Slider from "../../components/Slider/Slider";
import MainNews from "../../components/MainNews/MainNews";
import "./Home.scss";

const Home = () => {
  return (
    <div className="home">
      <TopNews />
      <Slider />
      <Adv />
      <MainNews />
    </div>
  );
};

export default Home;
