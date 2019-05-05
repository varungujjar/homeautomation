import React, { Component } from "react";
import { device } from "./api";


export class Weather extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            dataLoaded:false
        }
    }



    componentDidMount() {
        fetch("/api/weather")
            .then(response => response.json())
            .then((result) => {
                // console.log(result);
                this.setState({
                    items: result,
                    dataLoaded:true

                });
            })
            .catch((error) => {
                console.error(error)
            })
            device(result =>{
                if(result.weather==1){
                    this.setState({
                        items: result,
                        dataLoaded:true   
                    });
                }
            })    
    }


    render() {
        let data = this.state;
        if(data.dataLoaded==true){
        return (
            <div className="card card-shadow mt-4" >
                        <div className="card-body">
                            <div className="mb-4">
                                <div className="icon-left">
                                    <span className="text-xxl">{data.items.properties.temperature.value}</span>
                                    <span className="text-lg">° {data.items.properties.temperature.unit}</span>
                                </div>
                                <h2 className="">Outdoor Conditions</h2>
                                <span className="text-md">Acceptable</span>
                                <div className="clearfix"></div>
                            </div>
                            <div className="row">
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/humidity.svg" />
                                    <div className="text-xl">{data.items.properties.humidity.value}</div>
                                    <div className="text-md">{data.items.properties.humidity.unit}</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/light.svg" />
                                    <div className="text-xl">{data.items.properties.light.value}</div>
                                    <div className="text-md">{data.items.properties.light.unit}</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/pressure.svg" />
                                    <div className="text-xl">{data.items.properties.pressure.value}</div>
                                    <div className="text-md">{data.items.properties.pressure.unit}</div>
                                </div>
                                <div className="col-xs-3 text-left">
                                    <img src="assets/light/images/airquality.svg" />
                                    <div className="text-xl">{data.items.properties.gas.value}0K</div>
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
            <div>...</div>
        )
    }
}