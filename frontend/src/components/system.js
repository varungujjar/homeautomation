import React, { Component } from "react";
import { device } from "../system/socketio";


export class System extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            systemData: null,
            dataLoaded: false
        }
        this.intervalID = 0;
    }


    getData() {
        fetch("/api/system")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        systemData: result,
                        dataLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    componentDidMount() {
        this._isMounted = true;
        this.getData();
        this.intervalID = setInterval(() => {
            this.getData();
        }, 3000);
    }


    componentWillUnmount() {
        this._isMounted = false;
        clearInterval(this.intervalID);
    }


    render() {
        const data = this.state;
        const system = this.state.systemData;
        if (data.dataLoaded == true) {
            return (
                <>
                    <div className="row">
                        <div className="col-md-3"><div className="card card-shadow  mt-4">
                            <div className="card-body">
                                <img src="assets/light/images/uptime.svg" className="icon-left" />
                                <h4 className="text-bold">{system.process.description} </h4>
                                <span className="text-secondary title-case">Proccess Information</span>
                                <div>
                                    <span className={system.process.statename == "RUNNING" ? "badge bg-info text-capitalize" : "badge bg-danger text-capitalize"}>{system.process.statename}</span>
                                </div>
                                <div className="clearfix"></div>
                            </div>
                        </div></div>
                        <div className="col-md-3">
                            <div className="card card-shadow  mt-4">
                                <div className="card-body">
                                    <img src="assets/light/images/cpu.svg" className="icon-left" />
                                    <h4 className="text-bold">{system.cpu.percent}% Load</h4>
                                    <span className="text-secondary title-case">{system.cpu.temperature.value}°{system.cpu.temperature.unit} Temperature</span>
                                    <div className="clearfix"></div>
                                    <div className="progress mt-3">
                                        <div className={system.cpu.percent > 5 ? "progress-bar bg-danger" : "progress-bar bg-info"} role="progressbar" style={{ width: system.cpu.percent + "%" }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card card-shadow  mt-4">
                                <div className="card-body">
                                    <img src="assets/light/images/memory.svg" className="icon-left" />
                                    <h4 className="text-bold">{Number((system.memory.used / 1000) / 1000).toFixed(1)} MB Used</h4>
                                    <span className="text-secondary title-case">Total Memory {Number((system.memory.total / 1000) / 1000).toFixed(1)} MB</span>
                                    <div className="clearfix"></div>
                                    <div className="progress mt-3">
                                        <div className={system.memory.value > 50 ? "progress-bar bg-danger" : "progress-bar bg-info"} role="progressbar" style={{ width: system.memory.percent + "%" }} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card card-shadow  mt-4">
                                <div className="card-body">
                                    <img src="assets/light/images/sdcard.svg" className="icon-left" />
                                    <h4 className="text-bold">{Number((system.disk.free / 1000) / 1000 / 1000).toFixed(1)} GB Free</h4>
                                    <span className="text-secondary title-case">Total {Number((system.disk.total / 1000) / 1000 / 1000).toFixed(1)} GB</span>
                                    <div className="clearfix"></div>
                                    <div className="progress mt-3">
                                        <div className={system.disk.percent > 50 ? "progress-bar bg-danger" : "progress-bar bg-info"} style={{ width: system.disk.percent + "%" }} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card card-shadow mt-4">
                        <div className="card-header">
                            <h2>Services Information</h2>
                        </div>
                        <div className="card-body n-p">
                            <table className="table">
                                <tbody>

                                    {system.mqtt && (
                                    <tr>
                                        <th scope="row">MQTT Broker</th>
                                        <td className="text-right text-capitalize"><span className={system.mqtt.status == "active" ? "badge bg-success" : "badge bg-danger"}>{system.mqtt.status}</span></td>
                                    </tr>
                                    )}
                                    
                                    {system.redis && (
                                    <tr>
                                        <th scope="row">Redis Server</th>
                                        <td className="text-right text-capitalize"><span className={system.redis.status == "active" ? "badge bg-success" : "badge bg-danger"}>{system.redis.status}</span></td>
                                    </tr>
                                    )}

                                    {system.nginx && (
                                    <tr>
                                        <th scope="row">Nginx Server</th>
                                        <td className="text-right text-capitalize"><span className={system.nginx.status == "active" ? "badge bg-success" : "badge bg-danger"}>{system.nginx.status}</span></td>
                                    </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )
        }
        return (<div>...</div>)
    }
}