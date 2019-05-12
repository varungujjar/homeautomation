import React, { Component } from "react";
import { Rooms } from "../../components/rooms";
import { Scenes } from "../../components/scenes";
import { Devices } from "../../components/devices";
import { Horizon } from "../../components/horizon";
import { Weather } from "../../components/weather";
import { Home } from "../../components/home";
import { Header } from "../common/header";


export class Dashboard extends Component {
    constructor(props) {
        super(props);

    }
   
    render() {
        return (
            
            <><Header name={this.props.name}></Header>
                <div className="row">
                    <div className="col-md-4">
                        <Home></Home>
                        <Weather></Weather>
                        <Horizon></Horizon>
                    </div>
                    <div className="col-md-8">
                        <Rooms></Rooms>
                        <Scenes></Scenes>
                        <Devices></Devices>
                    </div>
                </div>
                </>
        )
    }
}

