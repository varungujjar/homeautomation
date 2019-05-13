import React, { Component } from "react";
import OwlCarousel from 'react-owl-carousel2';

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
        const options = {
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
        const items = this.state.items;
        // if (this.state.itemsLoaded == true) {
            return (
                <div className="section mt-4">
                <h3 className="mb-2">Scenes</h3>
                <OwlCarousel options={options}>
                    <div className="card card-shadow item">
                    <div className="card-body">
                        <span className="icon-1x icon-info icon-sunrise icon-left"></span>
                        <span className="text-bold mt-3">Early Morning</span>
                        <div className="text-secondary text-md">2 Devices Triggered</div>
                        <div className="clearfix"></div>
                        </div>
                    </div>
                    <div className="card card-shadow item">
                    <div className="card-body">
                        <span className="icon-1x icon-info icon-moon icon-left"></span>
                        <span className="text-bold mt-3">Good Night</span>
                        <div className="text-secondary text-md">2 Devices Triggered</div>
                        <div className="clearfix"></div>
                        </div>
                    </div>
                    <div className="card card-shadow item">
                    <div className="card-body">
                        <span className="icon-1x icon-info icon-popcorn icon-left"></span>
                        <span className="text-bold mt-3">Movie Time</span>
                        <div className="text-secondary text-md">2 Devices Triggered</div>
                        <div className="clearfix"></div>
                        </div>
                    </div>
                </OwlCarousel>
            </div>
            )
        // }
        return (<div>...</div>);
    }
}