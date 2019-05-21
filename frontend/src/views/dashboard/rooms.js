import React, { Component } from "react";
import Slider from "react-slick";


export class Rooms extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            items: [],
            itemsLoaded: false
        }
    }


    componentDidMount() {
        this._isMounted = true;
        fetch("/api/rooms")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        items: result,
                        itemsLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        const RoomItem = (props) => {
            return (
                <div className="slider-slide">
                    <div key={props.room.id} className="card card-shadow item  ">
                        <div className="card-body">
                            
                            <div className="text-center">
                                <span className={`icon-2x icon-${ props.room.icon ? props.room.icon : ""}`}></span>
                            </div>
                            <div className="text-bold mt-2 text-center">{props.room.name}</div>
                            <div className="text-secondary text-md text-center">2 Devices</div>
                        </div>
                    </div>
                </div>
            )
        }
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            arrows:false,
            swipeToSlide:true,
            slidesToShow: 5,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1280,
                    settings: {
                      slidesToShow: 4,
                      slidesToScroll: 1,
                      infinite: true,
                      dots: true
                    }
                  },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                  }
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll:1
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                  }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
              ]
          };
        const items = this.state.items;
        if (this.state.itemsLoaded == true) {
            return (
                <div className="section">
                    <h3 className="mb-2">Rooms</h3>
                    <div className="slider-wrapper">
                    <Slider {...settings}>
                        {items.map((item, index) => (
                            <RoomItem key={index} room={item} />
                        ))}
                    </Slider>
                    </div>
                </div>
            )
        }
        return (null);
    }
}