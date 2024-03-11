import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer>
    <div className="container">
        <div className="row">
            <div className="col-12">
             <div className="footer-content">
                 <p>2021 © Copyright SkyNature , All Rights Reserved.</p>
                 <div className="footer-content_social">
                     <a href="#"><i className="fab fa-facebook-square"></i></a>
                     <a href="#"><i className="fab fa-twitter-square"></i></a>
                     <a href="#"><i className="fab fa-google-plus-square"></i></a>
                 </div>
             </div>
            </div>
        </div>
    </div>
 </footer>
  );
};

export default Footer;
