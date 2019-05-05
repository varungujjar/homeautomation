import React, { Component } from "react";
import { device } from "./api"
import { Switch } from "./switch"


function Device(props){
        const device = props.device;
        if(device.type=="switch"){
            return (
                    <>
                        <Switch key={device.id} data={device}></Switch> 
                    </>
                   
                )
            }
        if(device.type=="sensor2"){
            return (
                    <div></div>
                )
        }
        return (
            <div></div>
        )
}

export class Devices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items:[],
            dataLoaded:false,
            socketLoaded:false,
        }
    }


    componentDidMount() {
        fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                this.setState({
                    items:result.sort((a, b) => a.id - b.id),
                    dataLoaded:true
                });
            })
            .catch((error) => {
                console.error(error)
            })
        device(result =>{
                this.setState({
                    items:this.state.items.filter(item => item.id!=result.id).concat(result).sort((a, b) => a.id - b.id),
                    socketLoaded:true
                });
            }) 
    }



    render() {
            const { items }  = this.state;
            if(this.state.dataLoaded==true || this.state.socketLoaded==true)
            {
                return (
                        <>
                            {items.map((item,index) => 
                                (
                                    <Device key={index} device={item} />
                                )
                            )}
                        </>
                        )
                }
                
                return(
                    <div>...</div>
                )

                
        
            }
           
           
}
