import React, { Component } from "react";
import { device } from "./api"


export class Switch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:props.data,
            relays:props.data.properties.relay
        }
        this.toggleState = this.toggleState.bind(this);
    }

    componentWillReceiveProps(props) {
        this.setState({
            data:this.props.data,
            relays:this.props.data.properties.relay
        })
        // console.log("after class");
        // console.log(this.props.data.properties.relay);
      }

   
    toggleState(deviceId, relayIndex, relayState){
        var relayIndexString =  relayIndex;
        var setRelaystate = 0;
        if(relayState==0){
            setRelaystate = 1;
        }
        const relay = {
            "relay":{"0":setRelaystate}
        }
        fetch('/api/device', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                device: deviceId,
                actions: relay,
            })
        })
        
      }
    


    render(){
        const data = this.state.data;
        const relays = this.state.relays;
        console.log("render now");
        console.log(relays);
        return (
            <div className="card card-shadow item">
                {
                  Object.keys(relays).map(index => 
                    ( 
                        <div key={index} className={ relays[index] ? ("on") : ("") } onClick={()=>this.toggleState(this.state.data.id, index, relays[index])}> 
                        <span className="show-device-props"><img src="assets/light/images/dots.svg" /></span>
                        {
                           relays[index] ? (<img src="assets/light/images/lampon.svg" />) : (<img src="assets/light/images/lampoff.svg" />)
                        }
                        
                        <div className="text-status">
                        {
                           relays[index] ? ("On") : ("Off")
                        }
                        </div>
                        <div className="text-bold mt-2">{data.name}</div>
                        <div className="text-secondary text-md">{data.room_name}</div>
                        </div>
                    )
                    
                    )
                }
            </div>  
        )
    }
}
