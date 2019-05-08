import React, { Component } from "react";
import OwlCarousel from 'react-owl-carousel2';
import { Rooms } from "../components/rooms"
import { Devices } from "../components/devices"
import { Horizon } from "../components/horizon"
import { Weather } from "../components/weather"
import { Home } from "../components/home"


export class Layout extends Component {
    constructor(props) {
        super(props);

    }


    render() {
        const options = {
            loop: false,
            margin: 15,
            nav: false,
            responsive: {
                0: {
                    items: 2
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 5
                }
            }
        };
        const options_scenes = {
            loop: false,
            margin: 15,
            nav: false,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            }
        };

        return (
            <div className="wrapper">
            <div className="row">
            <div className="col-md-9"> <div className="header mb-5">
                    <h1>{this.props.name}</h1>
                </div></div>
               
                <div className="col-md-3 text-right"> <img src="assets/light/images/morning.svg" className="icon-left" /></div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <Home></Home>
                        <Weather></Weather>
                        <Horizon></Horizon>
                    </div>
                    <div className="col-md-8">
                        <Rooms></Rooms>
                        <div className="section mt-4">
                            <h3 className="mb-2">Scenes</h3>
                            <OwlCarousel options={options_scenes}>
                                <div className="card card-shadow item">
                                    <img src="assets/light/images/morning.svg" className="icon-left" />
                                    <span className="text-bold mt-3">Early Morning</span>
                                    <div className="text-secondary text-md">2 Devices Triggered</div>
                                    <div className="clearfix"></div>
                                </div>
                                <div className="card card-shadow item">
                                    <img src="assets/light/images/night.svg" className="icon-left" />
                                    <span className="text-bold mt-3">Good Night</span>
                                    <div className="text-secondary text-md">2 Devices Triggered</div>
                                    <div className="clearfix"></div>
                                </div>
                                <div className="card card-shadow item">
                                    <img src="assets/light/images/movie.svg" className="icon-left" />
                                    <span className="text-bold mt-3">Movie Time</span>
                                    <div className="text-secondary text-md">2 Devices Triggered</div>
                                    <div className="clearfix"></div>
                                </div>
                            </OwlCarousel>
                        </div>
                        <Devices></Devices>
                    </div>
                </div>
            </div>)
    }
}

