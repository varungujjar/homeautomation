import React, { Component } from "react";
import { device } from "../../system/socketio";


export class Horizon extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
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
                        aboveHorizon: result.properties.astral.above_horizon,
                        astralTimeDigit: result.properties.astral.next_time.number,
                        astralTimeDigitUnit: result.properties.astral.next_time.unit,
                        astralNext: result.properties.astral.next_astral,
                        dataLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
        device(result => {
            if (result.component == "horizon") {
                if (this._isMounted) {
                    this.setState({
                        aboveHorizon: result.properties.astral.above_horizon,
                        astralTimeDigit: result.properties.astral.next_time.number,
                        astralTimeDigitUnit: result.properties.astral.next_time.unit,
                        astralNext: result.properties.astral.next_astral,
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
        // if(Object.keys(data).length > 0){
        //     console.log(data.properties.astral);
        // }
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