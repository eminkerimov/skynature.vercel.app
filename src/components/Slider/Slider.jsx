import React from 'react'
import Rectangle45 from "../../assets/img/Rectangle 45.png"
import Rectangle41 from "../../assets/img/Rectangle 4.1.png"
import Rectangle44 from "../../assets/img/Rectangle 4.4.png"
import Rectangle43 from "../../assets/img/Rectangle 4.43.png"
import "./Slider.scss"

const Slider = () => {
  return (
    <section className="slider">
    <div className="container">
      <div className="row">
        <div className="col-6">
          <div className="slider-item">
            <a href="#">
              <img src={Rectangle45} alt="rectangle45" />
              <div className="slider-item-content">
                <h3>
                  Everything in nature is lyrical in its ideal essence, tragic in its fate, and comic in its existence. George Santanayao
                </h3>
                <span>
                  <i className="fas fa-user-edit"></i>
                  2 min ago
                </span>
                <span>
                  <i className="fas fa-clock"></i>
                  7 min
                </span>
                <span>
                  <i className="fas fa-heart"></i>
                  160
                </span>
              </div>
            </a>
          </div>
        </div>
        <div className="col-6">
          <div className="row">
            <div className="col-12">
              <div className="slider-item right">
                <a href="#">
                  <img src={Rectangle41} alt="rectangle45" />
                  <div className="slider-item-content">
                    <h3>
                      Look deep into nature, and then you will understand everything better. Albert Einstein
                    </h3>
                    <span>
                      <i className="fas fa-user-edit"></i>
                      2 min ago
                    </span>
                    <span>
                      <i className="fas fa-clock"></i>
                      7 min
                    </span>
                    <span>
                      <i className="fas fa-heart"></i>
                      160
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="slider-item right">
                <a href="#">
                  <img src={Rectangle44} alt="rectangle45" />
                  <div className="slider-item-content">
                    <h3>
                      The earth has music for those who listen. William Shakespeare
                    </h3>
                  </div>
                </a>
              </div>
            </div>
            <div className="col-6">
              <div className="slider-item right">
                <a href="#">
                  <img src={Rectangle43} alt="rectangle45" />
                  <div className="slider-item-content">
                    <h3>
                      Nature does not hurry, yet everything is accomplished. Lao Tzu
                    </h3>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Slider