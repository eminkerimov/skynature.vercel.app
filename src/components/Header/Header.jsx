import React, { useState } from "react";
import "./Header.scss";
import Logo from "../../assets/img/logo.png"
import Search from "../../assets/img/srch.png"
import SVG from "../../assets/img/Component 2.svg"

const Header = () => {
  const [value, setValue] = useState("")
  const [searchBox, setSerchBox] = useState(false)

  return (
    <header>
    <div className="container">
      <div className="header-main">
        <a className="header-main_logo" href="/">
          <img src={Logo} alt="logo" />
        </a>
        <a className="header-main_btn" href="#" onClick={()=> setSerchBox(!searchBox)}>
          <img src={Search} alt="logo" />
        </a>
      </div>
      {searchBox && <div  className="header-search">
        <input
          type="text" value={value} 
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type for searching ..."
        />
        <a className="header-search_btn" href="#" onClick={()=> setSerchBox(false)}>
          <img src={SVG} alt="src" />
        </a>
      </div>}
    </div>
  </header>
  );
};

export default Header;
