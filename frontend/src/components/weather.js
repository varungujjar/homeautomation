import React, { Component } from "react";
import { device } from "../system/socketio";


export class Weather extends Component {
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
        fetch("/api/weather")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        items: result,
                        dataLoaded: true

                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
        device(result => {
            if (result.weather == 1) {
                if (this._isMounted) {
                    this.setState({
                        items: result,
                        dataLoaded: true
                    });
                }
            }
        })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        let data = this.state;
        if (data.dataLoaded == true) {
            return (
                <div className={`card card-shadow card-info mt-4 ${data.items.online ? "" : "offline"}`}>
                <div className="offline-icon"></div>
                    <div className="card-body">
                        <div className="mb-4">
                            <div className="icon-left">
                                <span className="text-xxl">{Number(data.items.properties.temperature.value).toFixed(1)}</span>
                                <span className="text-lg">° {data.items.properties.temperature.unit}</span>
                            </div>
                            <h2 className="">Outdoor Conditions</h2>
                            <span className="text-md">Acceptable</span>
                            <div className="clearfix"></div>
                        </div>
                        <div className="row">
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-humidity"></span>
                                <div className="text-xl">{Number(data.items.properties.humidity.value).toFixed(1)}</div>
                                <div className="text-md">{data.items.properties.humidity.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-light"></span>
                                <div className="text-xl">{data.items.properties.light.value}</div>
                                <div className="text-md">{data.items.properties.light.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-pressure"></span>
                                <div className="text-xl">{Number(data.items.properties.pressure.value).toFixed(1)}</div>
                                <div className="text-md">{data.items.properties.pressure.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-wind"></span>
                                <div className="text-xl">{data.items.properties.gas.value}K</div>
                                <div className="text-md">{data.items.properties.gas.unit}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        {data.items.properties.voltage.value} {data.items.properties.voltage.unit}
                    </div>
                </div>
            )
        }
        return (
            null
        )
    }
}