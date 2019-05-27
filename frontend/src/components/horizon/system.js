import React, {Component} from "react";
import { socket } from "../../system/socketio";


export const ModuleRule = (props) => {
    const horizon = props.component.if.properties.astral.above_horizon;
    return (
        <div className="card card-outline-default">
            <div className="p-all-less">
            <span className={`icon-1x icon-left ${horizon == "true" ? "icon-bg-warning icon-sunrise " : "icon-bg-dark icon-moon"}`}></span>
                <div className="text-bold">{horizon == "true" ? ("Sun Above Horizon") : ("Sun Below Horizon")}</div>
                <div className="text-secondary">
                {horizon == "true" ? ("On Sunrise") : ("On Sunset")}
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
    )

}

export const Module = (props) => {
    const device = props.data;
    return (
        <div className="slider-slide">
            <div className={`card card-shadow item card-hover ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                   Horizon
                </div>
            </div>
        </div>
    )
}



export class Horizon extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            deviceId:0,
            aboveHorizon: null,
            astralTimeDigit: 0,
            astralTimeDigitUnit: null,
            astralNext: null,
            dataLoaded: false
        }
    }



    componentDidMount() {
        this._isMounted = true;
        fetch("/api/horizon")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {      
                    this.setState({
                        deviceId:result.id,
                        aboveHorizon: result.properties.astral.above_horizon,
                        astralTimeDigit: result.properties.astral.next_time.number,
                        astralTimeDigitUnit: result.properties.astral.next_time.unit,
                        astralNext: result.properties.astral.next_astral,
                        dataLoaded: true
                    });
                }     
                socket.on(this.state.deviceId, data => {
                    console.log(data);
                    if (this._isMounted) {
                        this.setState({
                            aboveHorizon: data.properties.astral.above_horizon,
                            astralTimeDigit: data.properties.astral.next_time.number,
                            astralTimeDigitUnit: data.properties.astral.next_time.unit,
                            astralNext: data.properties.astral.next_astral,
                            dataLoaded: true
                        });
                    }
                }); 
               
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
                <div className={`card mt-4 mb-4 ${this.state.aboveHorizon == "true" ? "card-warning " : "card-default"}`}>
                    <div className="card-body">
                        <span className={`icon-2x icon-left ${this.state.aboveHorizon == "true" ? "icon-sunrise " : "icon-moon"}`}></span>
                        <h2 className="mt-1">{this.state.aboveHorizon == "true" ? ("Above Horizon") : ("Below Horizon")}</h2>
                        <span className="text-secondary title-case">{this.state.astralNext} in Next {this.state.astralTimeDigit} {this.state.astralTimeDigitUnit}</span>
                        <div className="clearfix"></div>
                    </div>
                </div>
            )
        }
        return (null)
    }
}