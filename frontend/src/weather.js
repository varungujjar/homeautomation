import React, { Component } from "react";

export class Weather extends Component {
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
        fetch("/api/weather")
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
            <div className="card card-shadow mt-4">
                        <div className="card-body">
                            <div className="mb-4">
                                <div className="icon-left">
                                    <span className="text-xxl">23.5</span>
                                    <span className="text-lg">° C</span>
                                </div>
                                <h2 className="">Outdoor Conditions</h2>
                                <span className="text-md">Acceptable</span>
                                <div className="clearfix"></div>
                            </div>
                            <div className="row">
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/humidity.svg" />
                                    <div className="text-xl">40</div>
                                    <div className="text-md">%</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/light.svg" />
                                    <div className="text-xl">40</div>
                                    <div className="text-md">lux</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/pressure.svg" />
                                    <div className="text-xl">1001.5</div>
                                    <div className="text-md">hPa</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/airquality.svg" />
                                    <div className="text-xl">650K</div>
                                    <div className="text-md">ppm</div>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                        </div>
                    </div>
        )
    }
}