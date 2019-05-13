import React, { Component } from "react";
import { Rooms } from "../../components/rooms";
import { Scenes } from "../../components/scenes";
import { Devices } from "../../components/devices";

import { Header } from "../common/header";


export class Dashboard extends Component {
    constructor(props) {
        super(props);

    }
   
    render() {
        return (
            
            <><Header name={this.props.name} icon={this.props.icon}></Header>
               
                        <Rooms></Rooms>
                        <Scenes></Scenes>
                        <Devices></Devices>
                   
                </>
        )
    }
}

