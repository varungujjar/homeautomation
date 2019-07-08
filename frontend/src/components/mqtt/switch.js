import React, { Component } from "react";
import { DeviceModal } from "../../views/common/devicemodal";
import { DeviceModalEdit } from "../../views/common/devicemodaledit";
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



export class ModuleList extends Component {
    constructor(props) {
        super(props);
        if(props.values){
            this.state = {
                selectedProperty:Object.keys(this.props.values.properties)[0] ? Object.keys(this.props.values.properties)[0] : Object.keys(this.props.data.properties)[0],
            }
        }
        this.defaultIfProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": {'relay':{"0":0}}}
        this.deviceData = this.props.data;
        this.deviceValues = this.props.values;
        this.allowedValues = {
            "energy":"Energy",
            "relay":"Relay",
            "power":"Power",
            "apparant":"Apparant",
            "voltage":"Voltage",
            "current":"Current",
            "vcc":"VCC"
        }
    }


    onPropertyChange = (event) => {
        const selectedProperty = this.state.selectedProperty;
        this.deviceValues.properties[selectedProperty] = event.currentTarget.value;
        this.props.setFieldValue(this.deviceValues.properties[selectedProperty])
    }

    
    onSelectProperty = (selectedProperty) => {
        this.setState({
            selectedProperty: selectedProperty.currentTarget.value
        })

        const selectedPropertyChange = selectedProperty.currentTarget.value
        const relaysInitialStore = this.deviceValues.properties.relay;
        this.deviceValues.properties = {};//empty all properties before writing new one

        if(selectedPropertyChange=="relay"){
            this.deviceValues.properties.relay = relaysInitialStore;
            this.props.setFieldValue(this.deviceValues.properties.relay);
        }else{
            this.props.setFieldValue(this.deviceValues.properties);
        }

        this.deviceValues.properties[selectedPropertyChange] = this.deviceData.properties[selectedPropertyChange];
        this.props.setFieldValue(this.deviceValues.properties[selectedPropertyChange])
    }
    

    handleRelay = (event) => {
        const target = event.currentTarget;
        if (target.checked) {
            this.deviceValues.properties.relay[target.id] = 1;
        } else {
            this.deviceValues.properties.relay[target.id] = 0;
        }
        this.props.setFieldValue(this.deviceValues.properties.relay[target.id])
        this.deviceData.properties.relay[target.id] = this.deviceValues.properties.relay[target.id] //update the UI
    }


    render(){
        

       
    return (
            <div>
                <div className={`card card-outline-default h-100 ${this.deviceData.online ? "" : "offline"}`}>
                    <div className="offline-icon text-danger"></div>
                    <div className="p-all-less">
                        <span className={`icon-left icon-1x icon-lamp ${this.deviceData.properties.relay[0] ? "icon-bg-success" : "icon-bg-default"}`}></span>
                        <div className="text-bold mt-1">{this.deviceData.name ? this.deviceData.name : "..."}</div>
                        <div className="text-secondary text-md">{this.deviceData.room_name}</div>
                    </div>
                    <div className="clearfix"></div>

                    {
                            this.props.addDefaultProperties && (
                                <button type="button" variant="primary" onClick={() => {this.props.addDefaultProperties(this.defaultIfProperties)}}>+ ADD</button>
                            )
                        }

                    {(() => {
                        if (this.deviceValues && this.props.dataType == "if") {
                            return (
                                <div className="p-all-less">
                                    {
                                        
                                        this.state.selectedProperty == "relay" &&
                                        Object.keys(this.deviceData.properties.relay).map((key, index) => {
                                            let checked = false;
                                            if (this.deviceValues.properties.relay[key] == 1) { checked = true; }
                                            return (
                                                <div className="form-check form-check-inline" key={index}>
                                                    <input className="form-check-input" type="checkbox" id={key} name={`${this.props.dataType}[properties][relay][${key}]`} onChange={this.handleRelay} checked={checked} />
                                                    <label className="form-check-label">Relay {key}</label>
                                                </div>
                                            )
                                        })
                                    }
                                    
                                    <select name={`${this.props.dataType}[condition]`} value={this.deviceValues.condition} onChange={this.props.handleChange}>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>

                                    <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty}>
                                        {    
                                            Object.keys(this.deviceData.properties).map((property, index) => {
                                                if(property in this.allowedValues){
                                                    return (
                                                        <option value={`${property}`} key={index}>{this.allowedValues[property]}</option>
                                                    )
                                                }
                                            })
                                        }
                                    </select>

                                    {
                                        this.state.selectedProperty && this.state.selectedProperty != "relay" ?
                                            (
                                                <input className="form-control" value={this.deviceValues.properties[this.state.selectedProperty] || this.deviceData.properties[this.state.selectedProperty]} name={`${this.props.dataType}[properties][${this.state.selectedProperty}]`} onChange={this.onPropertyChange} />
                                            )
                                            : null
                                    }
                                </div>
                            )
                        } else if (this.deviceValues && this.props.dataType == "and") {
                            return (
                                <div>and</div>
                            )
                        } else if (this.deviceValues && this.props.dataType == "then") {
                            // console.log(this.props.data.actions)
                            return (
                                <div>

                                    <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty}>
                                        {
                                            Object.keys(this.deviceData.actions).map((property, index) => {
                                                return (
                                                    <option value={`${property}`} key={index}>{this.allowedValues[property]}</option>
                                                )
                                            })
                                        }
                                    </select>

                                    {
                                        this.state.selectedProperty == "relay" &&
                                        Object.keys(this.deviceData.actions.relay).map((key, index) => {
                                            let checked = false;
                                            if (this.deviceValues.properties.relay[key] == 1) { checked = true; }
                                            return (
                                                <div className="form-check form-check-inline" key={index}>
                                                    <input className="form-check-input" type="checkbox" id={key} name={`${this.props.dataType}[properties][relay][${key}]`} onChange={this.handleRelay} checked={checked} />
                                                    <label className="form-check-label">Relay {key}</label>
                                                </div>
                                            )
                                        })
                                    }
                                        


                                </div>
                            )
                        }
                    })()}
                </div>
            </div>
        )
    }
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
