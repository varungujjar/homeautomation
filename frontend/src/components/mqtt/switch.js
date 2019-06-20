import React, { Component } from "react";
import { DeviceModal } from "../../views/common/devicemodal";
import Moment from 'react-moment';

const convertAgo = (datetime) => {
    var var_datetime = new Date(datetime);
    return <Moment fromNow ago>{var_datetime}</Moment>
}

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



export const ModuleModal = (props) => {

    const data = props.data;
    const properties = data.properties;
    const relays = properties.relay;

    return(
        <>
            <div className={`${relays[0] ? "bg-success" : "bg-default"}`}>
                <div className={`${data.properties.online ? "" : ""}`}>
                    <div className="offline-icon text-danger"></div>
                    <div className="p-all-less-md">
                        <div className="row">
                            <div className="col-md-6">
                                <span className={`icon-left mb-4 icon-1x icon-lamp ${relays[0] ? "icon-bg-success" : "icon-bg-default"}`}></span>
                                <div className="text-bold mt-1 text-light">{data.name ? data.name : "..."}</div>
                                <div className="text-light text-md mb-1">{data.room_name}</div>
                                <div>
                                <span className="badge badge-dark">{data.component}</span> <span className="badge badge-dark">{data.type}</span>
                                </div>
                            </div>
                            <div className="col-md-6 text-right">
                                <span className="text-xxl text-light">{properties.current} W</span>
                                <span className="text-lg"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          
            <div className="p-all-less-md">
            <h4 className="mb-2 text-bold">Device Properties</h4>
                <div className="row">
                    <div className="col-md-6">
                       
                        <ul className="property-list">
                        <li>
                            <span className="text-bold">Host : </span> {properties.host}
                        </li>
                        <li>
                            <span className="text-bold">Version : </span> {properties.version}
                        </li>
                        <li>
                            <span className="text-bold">SSID : </span> {properties.ssid}
                        </li>
                        <li>
                            <span className="text-bold">Strength : </span> {properties.rssi}
                        </li>
                        <li>
                            <span className="text-bold">Mac : </span> {properties.mac}
                        </li>
                        <li>
                            <span className="text-bold">IP : </span> {properties.ip}
                        </li>
                    </ul></div>
                    <div className="col-md-6">
                        <ul className="property-list">
                            <li>
                                <span className="text-bold">VCC : </span> {properties.vcc} mAh
                            </li>
                            <li>
                                <span className="text-bold">Voltage : </span> {properties.voltage} V
                            </li>
                            <li>
                                <span className="text-bold">Energy : </span> {properties.energy} Kwh
                            </li>
                            <li>
                                <span className="text-bold">Current : </span> {properties.current} W
                            </li>
                            <li>
                                <span className="text-bold">Subscribe : </span> {properties.subscribe}
                            </li>
                            <li>
                                <span className="text-bold">Publish : </span> {properties.publish}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="modal-footer text-muted text-left">
            <i className="far fa-clock "/> Last Updated {convertAgo(data.modified)} ago
            </div>
        </>
    )
}


export const Module = (props) => {
    
    const device = props.data;
    const relays = props.data.properties.relay;
   
    return (
        <>
        <div className="slider-slide">
            <div className={`card card-shadow card-module-height item card-hover ${device.online ? "" : "offline"}`}>
           
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                    {
                        Object.keys(relays).map(index =>
                            (
                                <div key={index} className={relays[index] ? ("on") : ("")} >
                                    <DeviceModal data={device}/>  
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
        </>
    )


    
}
