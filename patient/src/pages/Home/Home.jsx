import React from "react";
import Header from "../../components/Header/Header";
import Banner from "../../components/Banner/Banner";
import SpecialityMenu from "../../components/SpecialityMenu/SpecialityMenu";
import TopDoctors from "../../components/TopDoctors/TopDoctors";

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
