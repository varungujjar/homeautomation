import React, { Component } from "react";
import Slider from "react-slick";
import { device } from "../../system/socketio"
import { Switch } from "../../components/switch"


export class Devices extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            items: [],
            dataLoaded: false
        }
    }


    componentDidMount() {
        this._isMounted = true;
        fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        items: result.sort((a, b) => a.order - b.order),
                        dataLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
        device(result => {
            if (this._isMounted) {
                this.setState({
                    items: this.state.items.filter(item => item.id != result.id).concat(result).sort((a, b) => a.order - b.order),
                    dataLoaded: true
                });
            }
        })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        const Device = function (props) {
            const device = props.device;
            // console.log(props.device);
            if (device.type == "switch") {
                return (
                    <>
                        <Switch key={device.id} data={device}></Switch>
                    </>
                )
            }
            if (device.type == "sensor2") {
                return (
                    <></>
                )
            }
            return (
                <></>
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
        const { items } = this.state;
        if (this.state.dataLoaded == true) {
            console.log(items);
            return (

                <div className="section mt-4">
                    <h3 className="mb-2">Devices</h3>
                    <div className="slider-wrapper">
                    <Slider {...settings}>
                        {items.map((item, index) =>
                            (
                                <Device key={index} device={item} />
                            )
                        )}
                    </Slider>
                </div>
                </div>
            )
        }
        return (
            null
        )
    }
}
