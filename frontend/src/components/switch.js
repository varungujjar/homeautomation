import React from "react";

    const toggleState = (deviceId, relayIndex, relayState) => {
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

      
    export const Switch = (props) => {
        const device = props.data;
        const relays = props.data.properties.relay;
        return (
            <div className={`card card-shadow item card-hover ${device.online ? "" : "offline"}`}>
            <div className="offline-icon text-danger"></div>
             <div className="card-body">
                {
                  Object.keys(relays).map(index => 
                    ( 
                        <div key={index} className={ relays[index] ? ("on") : ("") } onClick={() => {toggleState(device.id, index, relays[index])}}> 
                        <span className="show-device-props"><img src="assets/light/images/dots.svg" /></span>
        
                        <span className={`icon-1x icon-lamp ${relays[index] ? "icon-success" : "icon-default"}`}></span> 

                        
                        <div className="text-status">
                        {
                           relays[index] ? ("On") : ("Off")
                        }
                        </div>
                        <div className="text-bold mt-2">{device.name}</div>
                        <div className="text-secondary text-md">{device.room_name}</div>
                        </div>
                    )
                    
                    )
                }
                </div>
            </div>  
        )
    }
