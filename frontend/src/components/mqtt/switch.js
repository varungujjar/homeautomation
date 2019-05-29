import React from "react";

const toggleState = (deviceId, relayIndex, relayState) => {
    var relayIndexString = relayIndex;
    var setRelaystate = 0;
    if (relayState == 0) {
        setRelaystate = 1;
    }
    const relay = {
        "relay": { "0": setRelaystate }
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

export const ModuleRule = (props) => {
    const relays = props.component.if.properties.relay;
    const online =  props.data.online;
    return (
        <div className={`card card-outline-default h-100 ${online ? "" : "offline"}`}>
            <div className="offline-icon text-danger"></div>

            <div className="p-all-less">
                <span className={`icon-left icon-1x icon-lamp ${relays[0] ? "icon-bg-success" : "icon-bg-default"}`}></span>
                <div className="text-bold mt-1">{props.data.name ? props.data.name : "..."}</div>
                <div className="text-secondary text-md">{props.data.room_name}</div>
            </div>
            <div className="clearfix"></div>
        </div>
    )

}


export const Module = (props) => {
    const device = props.data;
    const relays = props.data.properties.relay;
    return (
        <div className="slider-slide">
            <div className={`card card-shadow card-module-height item card-hover ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                    {
                        Object.keys(relays).map(index =>
                            (
                                <div key={index} className={relays[index] ? ("on") : ("")} >
                                    <span className="show-device-props"><img src="assets/light/images/dots.svg" /></span>
                                    <div onClick={() => { toggleState(device.id, index, relays[index]) }}>
                                    <span className={`icon-1x icon-lamp ${relays[index] ? "icon-bg-success" : "icon-bg-default"}`} ></span>
                                    <div className="text-status">
                                        {
                                            relays[index] ? ("On") : ("Off")
                                        }
                                    </div>
                                    <div className="text-bold mt-2">{device.name ? device.name : "..."}</div>
                                    <div className="text-secondary text-md">{device.room_name}</div>
                                    </div>
                                </div>
                            )

                        )
                    }
                </div>
            </div>
        </div>
    )
}
