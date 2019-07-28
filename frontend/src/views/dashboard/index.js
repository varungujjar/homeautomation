import React, { Component } from "react";
import { Rooms } from "./rooms";
import { Scenes } from "./scenes";
import { Devices } from "./devices";
import { Header } from "../common/header";
import { Horizon } from "../../components/horizon";
import { Weather } from "./weather";
import { Home } from "./home";

export class Dashboard extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <>
                <Home />
                <div className="row mt-5">
                    <div className="col-md-5 b-r-default"><Weather/></div>
                    <div className="col-md-7">
                    <div className="row h-100">
                        <div className="col-md-6 b-r-default"><div className="p-all-less"><Horizon/></div></div>
                        <div className="col-md-6 h-100">
                        <div className="p-all-less">
                             <div className="text-info text-3x text-thin">160 <span className="text-secondary text-normal">kwH</span></div>
                        <div className="clearfix"></div>
                        <h2 className="mt-1 text-white">Power Consumption</h2>
                        <span className="text-secondary">Overview</span>
                        </div>
                        </div>
                    </div>
                    </div>

                   
                </div>
                {/* <Rooms></Rooms> */}
                <Scenes/>
                <Devices/>
            </>
        )
    }
}
