import React, { Component } from "react";
import { Switch } from "./switch"


export class Device extends Component {
    constructor(props) {
        super(props);
        this.state = {
            item:props.device
        }
        console.log(props.device);
    }

    componentDidMount() {
        //console.log(this.props.device);
        this.setState({
             item:this.props.device
        })
    }


    

           



}