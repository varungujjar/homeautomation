import React, { Component } from "react";

export class Horizon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            aboveHorizon: null,
            astralTimeDigit: 0,
            astralTimeDigitUnit: null,
            astralNext: null
        }
    }



    componentDidMount() {
        fetch("/api/horizon")
            .then(response => response.json())
            .then((result) => {
                this.setState({
                    items: result,
                    aboveHorizon: result.properties.astral.above_horizon,
                    astralTimeDigit: result.properties.astral.next_time.number,
                    astralTimeDigitUnit: result.properties.astral.next_time.unit,
                    astralNext: result.properties.astral.next_astral
                });
            })
            .catch((error) => {
                console.error(error)
            })
    }


    render() {
        let data = this.state;
        // if(Object.keys(data).length > 0){
        //     console.log(data.properties.astral);
        // }
        return (
            <div className="card card-shadow mt-4 mb-4">
                <div className="card-body">
                    {this.state.aboveHorizon=="true" ? (<img src="assets/light/images/sun.svg" className="icon-left" /> ) : ( <img src="assets/light/images/moon.svg" className="icon-left" />)}    
                    <h2>{this.state.aboveHorizon=="true" ? ( "Above Horizon" ) : ( "Below Horizon")}</h2>                 
                <span className="text-secondary title-case">{this.state.astralNext} in Next {this.state.astralTimeDigit} {this.state.astralTimeDigitUnit}</span>
                    <div className="clearfix"></div>
                </div>
            </div>
        )
    }
}