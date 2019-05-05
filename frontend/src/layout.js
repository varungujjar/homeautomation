import React, { Component } from "react";
import OwlCarousel from 'react-owl-carousel2';
import { Rooms } from "./rooms"
import { Horizon } from "./horizon"
import { Weather } from "./weather"
import { Devices } from "./devices"


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
            <div className="header mb-5">
                <h1>{this.props.name}</h1>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="card card-shadow">
                        <div className="card-body">
                            <img src="assets/light/images/home.svg" />
                            <h2 className="mt-3">Good Morning, Varun</h2>
                            <span className="text-secondary text-lg">12:00:56 PM</span>
                            <p className="mt-2">I will keep you updated right here with the most important events of your home.
                        </p>
                        </div>
                    </div>
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
                    <div className="section mt-4">
                        <h3 className="mb-2">Devices</h3>
                            
                             <Devices></Devices>
                    </div>
                </div>
            </div>
        </div>)
}
}

