import React, { Component } from "react";
import { socket } from "../../system/socketio";


export class Weather extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            deviceId:0,
            item: [],
            dataLoaded: false
        }
    }


    componentDidMount() {
        this._isMounted = true;
        fetch("/api/devices/5")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        deviceId:result.id,
                        item: result,
                        dataLoaded: true

                    });
                    socket.on(this.state.deviceId, data => {
                        // console.log(data);
                        if (this._isMounted) {
                            this.setState({
                                item: data,
                                dataLoaded: true
                            });
                        }
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
        let data = this.state;
        if (data.dataLoaded == true) {
            return (
                <div className={`card card-shadow card-info mt-4 ${data.item.online ? "" : "offline"}`}>
                <div className="offline-icon"></div>
                    <div className="card-body">
                        <div className="mb-4">
                            <div className="icon-left">
                                <span className="text-xxl">{Number(data.item.properties.temperature.value).toFixed(1)}</span>
                                <span className="text-lg">° {data.item.properties.temperature.unit}</span>
                            </div>
                            <h2 className="">Outdoor Conditions</h2>
                            <span className="text-md">Acceptable</span>
                            <div className="clearfix"></div>
                        </div>
                        <div className="row">
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-humidity"></span>
                                <div className="text-xl">{Number(data.item.properties.humidity.value).toFixed(1)}</div>
                                <div className="text-md">{data.item.properties.humidity.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-light"></span>
                                <div className="text-xl">{data.item.properties.light.value}</div>
                                <div className="text-md">{data.item.properties.light.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-pressure"></span>
                                <div className="text-xl">{Number(data.item.properties.pressure.value).toFixed(1)}</div>
                                <div className="text-md">{data.item.properties.pressure.unit}</div>
                            </div>
                            <div className="col-xs-3 text-left">
                                <span className="icon-1x icon-wind"></span>
                                <div className="text-xl">{data.item.properties.gas.value}K</div>
                                <div className="text-md">{data.item.properties.gas.unit}</div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        {data.item.properties.voltage.value} {data.item.properties.voltage.unit}
                    </div>
                </div>
            )
        }
        return (
            null
        )
    }
}