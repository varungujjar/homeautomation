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
                <div className={`p-all-less ${data.item.online ? "" : "offline"}`}>
                    <div className="offline-icon"></div>

                <div className="offline-box">

                    <div className="float-left mr-4">
                    <span className="text-10x text-thin text-white">
                       {
                           Number(data.item.properties.temperature.value).toFixed(1) ? Number(data.item.properties.temperature.value).toFixed(0) : "..."
                       }
                    </span>
                    <span className="text-1x text-thin text-white">
                    °{data.item.properties.temperature.unit ? data.item.properties.temperature.unit : "C"}
                    </span>
                    <div className="clearfix"></div>
                    <div className="text-normal text-white mt-3">{data.item.properties.gas.value ? data.item.properties.gas.value : null }K / Acceptable <span className="dot bg-success dot-ripple"></span></div>
                </div>

                <div className="float-left">
                    <div className="mb-2"><span className="icon-humidity text-md text-info"></span><span className="text-md text-white"> {Number(data.item.properties.humidity.value).toFixed(1) ? Number(data.item.properties.humidity.value).toFixed(1) : "..."} </span><span className="text-secondary text-normal">%</span></div>
                    <div className="mb-2"><span className="icon-light text-md text-info"></span><span className="text-md text-white"> {data.item.properties.light.value ? data.item.properties.light.value : "..."} </span><span className="text-secondary text-normal">lux</span></div>
                    <div className="mb-2"><span className="icon-pressure text-md text-info"></span><span className="text-md text-white"> {Number(data.item.properties.pressure.value).toFixed(1) ? Number(data.item.properties.pressure.value).toFixed(1) : "..."} </span><span className="text-secondary text-normal">hPa</span></div>
                    <div className="text-normal text-white mt-3">{data.item.properties.voltage.value} {data.item.properties.voltage.unit}</div>

                </div>

                <div className="clearfix"></div>
                </div>
       
                </div>
            )
        }
        return (
            null
        )
    }
}