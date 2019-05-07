import React, { Component } from "react";
import OwlCarousel from 'react-owl-carousel2';
import { device } from "./socketio"
import { Switch } from "../components/switch"

export class Devices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            dataLoaded: false
        }
    }
    componentDidMount() {
        fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                this.setState({
                    items: result.sort((a, b) => a.id - b.id),
                    dataLoaded: true
                });
            })
            .catch((error) => {
                console.error(error)
            })
        device(result => {
            this.setState({
                items: this.state.items.filter(item => item.id != result.id).concat(result).sort((a, b) => a.id - b.id),
                dataLoaded: true
            });
        })
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
        const { items } = this.state;
        if (this.state.dataLoaded == true) {
            return (
                <div className="section mt-4">
                <h3 className="mb-2">Devices</h3>
                    <OwlCarousel options={options}>
                        {items.map((item, index) =>
                            (
                                <Device key={index} device={item} />
                            )
                        )}
                    </OwlCarousel>
                    </div>
              
            )
        }
        return (
            <div>...</div>
        )
    }
}
