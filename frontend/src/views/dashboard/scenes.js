import React, { Component } from "react";
import Slider from "react-slick";

export class Scenes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            itemsLoaded: false
        }
    }
    componentDidMount() {
        // fetch("/api/rooms")
        //     .then(response => response.json())
        //     .then((result) => {
        //         this.setState({
        //             items: result,
        //             itemsLoaded: true
        //         });
        //     })
        //     .catch((error) => {
        //         console.error(error)
        //     })
    }
    render() {
        
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            arrows:false,
            swipeToSlide:true,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1219,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                      infinite: true,
                      dots: true
                    }
                  },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                  }
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll:1
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
              ]
          };

        const RoomItem = (props) => {
            return (
                <div key={props.room.id} className="card card-shadow item">
                    <div className="card-body">
                        <img src="assets/light/images/bedroom.svg" />
                        <div className="text-bold mt-2">{props.room.name}</div>
                        <div className="text-secondary text-md">2 Devices</div>
                    </div>
                </div>
            )
        }
        
        const items = this.state.items;


        // if (this.state.itemsLoaded == true) {
            return (
                <div className="section mt-4">
                <div className="slider-wrapper">
                <Slider {...settings}>
                    <div className="slider-slide">
                    <div className="card card-shadow card-hover bg-dark">
                    <div className="card-body">
                        <span className="icon-2x text-white icon-sunrise icon-left"></span>
                        <div className="mt-2">
                        <span className="text-white">Early Morning</span>
                        <div className="text-secondary">2 Devices Triggered</div>

                        </div>
                        
                        <div className="clearfix"></div>
                        </div>
                    </div>
                    </div>
                    <div className="slider-slide">
                    <div className="card card-shadow card-hover bg-dark">
                    <div className="card-body">
                        <span className="icon-2x text-white icon-moon icon-left"></span>
                        <div className="mt-2"></div>
                        <span className="text-white">Good Night</span>
                        <div className="text-secondary">2 Devices Triggered</div>
                        </div>
                        <div className="clearfix"></div>
                        </div>
                    </div>
                    
                    <div className="slider-slide">
                    <div className="card card-shadow card-hover bg-dark">
                    <div className="card-body">
                        <span className="icon-2x text-white icon-popcorn icon-left"></span>

                        <div className="mt-2">
                        <span className="text-white mt-3">Movie Time</span>
                        <div className="text-secondary">2 Devices Triggered</div>
                        </div>
                        <div className="clearfix"></div>
                        </div>
                    </div>
                    </div>
                </Slider>
                </div>
            </div>
            )
        // }
        return (<div>...</div>);
    }
}