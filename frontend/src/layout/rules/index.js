import React, { Component } from "react";
import { Header } from "../common/header";


export class Automation extends Component {
    constructor(props) {
        super(props);
    }
   
    render() {

        return (
            <>
                <Header name={this.props.name}></Header>
             
            </>)
    }
}

