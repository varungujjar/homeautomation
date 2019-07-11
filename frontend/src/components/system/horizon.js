import React, {Component} from "react";
import { socket } from "../../system/socketio";
import { DeviceModal } from "../../views/common/devicemodal";


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.defaultIfAndProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": {'astral':{"above_horizon":this.props.data.properties.astral.above_horizon}}};
        if(this.props.values){
            this.deviceValues = this.props.values;
        }   
        this.deviceData = this.props.data;
        if(this.deviceValues){
            this.state = {
                selectedProperty:this.deviceValues.properties.astral.above_horizon ? this.deviceValues.properties.astral.above_horizon : this.deviceData.properties.astral.above_horizon,
            }
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
        }
    }    

    onSelectProperty = (selectedProperty) => {
        this.setState({
            selectedProperty: selectedProperty.currentTarget.value
        })
        this.deviceData.properties.astral.above_horizon = selectedProperty.currentTarget.value
        this.deviceValues.properties.astral.above_horizon = selectedProperty.currentTarget.value;
        this.props.setFieldValue(this.deviceValues.properties.astral.above_horizon)
    } 

    
    componentWillUnmount() {
        this._isMounted = false;
    }

    render(){
        return (
                <div>
                     <div className="card card-outline-default">
                        <div className="p-all-less">
                        <span className={`icon-1x icon-left ${this.deviceData.properties.astral.above_horizon == "true" ? "icon-bg-warning icon-sunrise " : "icon-bg-dark icon-moon"}`}></span>
                            <div className="text-bold">{this.deviceData.properties.astral.above_horizon == "true" ? ("Sun Above Horizon") : ("Sun Below Horizon")}</div>
                            <div className="text-secondary">
                            {this.deviceData.properties.astral.above_horizon == "true" ? ("On Sunrise") : ("On Sunset")}
                            </div>
                            <div className="clearfix"></div>
                            {
                                this.props.addDefaultProperties && ( this.props.dataType == "if" || this.props.dataType == "and" )&& (
                                    <button type="button" variant="primary" onClick={() => {this.props.addDefaultProperties(this.defaultIfAndProperties)}}>+ ADD If AND</button>
                                )
                            }
                           
                            {
                            this.deviceValues &&
                            (() => {
                            if (this.props.dataType == "if" || this.props.dataType == "and") {
                                return (
                                        <>
                                        <input type="hidden" name={`${this.props.dataType}[condition]`} value={this.deviceValues.condition} onChange={this.props.handleChange}/>
                                            
                                        <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty}>
                                           <option value="false">On Sunset</option>
                                           <option value="true">On Sunrise</option>
                                        </select>
                                        </>
                                    
                                )
                            }
                        })()
                        }
                        {
                             this.deviceValues && (
                                <button type="button" variant="primary" onClick={() => {this.props.deleteDefaultProperties(this.props.indexMap, this.props.dataType)}}>- Remove</button>
                             ) 
                        }
                        </div>
                    </div>
                </div>
            )
    }
}


export const ModuleModal = (props) => {
    return(
        <div>
             {JSON.stringify(props.data)}
        </div>
    )
}


export const Module = (props) => {
    const device = props.data;
    return (
        <div className="slider-slide">
            <div className={`card card-module-height card-shadow item ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                        <DeviceModal data={device}/> 
                        <span className={`icon-1x icon-bg-default ${device.properties.astral.above_horizon == "true" ? "icon-sunrise icon-bg-warning " : "icon-moon"}`}></span>
                        <div className="text-status ">{device.properties.astral.above_horizon == "true" ? ("Above Horizon") : ("Below Horizon")}</div>
                        <div className="text-secondary title-case mt-2">{device.properties.astral.next_astral} in {device.properties.astral.next_time.number} {device.properties.astral.next_time.unit}</div>
                        <div className="clearfix"></div>
                
                </div>
            </div>
        </div>
    )
}



export class Horizon extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            deviceId:0,
            aboveHorizon: null,
            astralTimeDigit: 0,
            astralTimeDigitUnit: null,
            astralNext: null,
            dataLoaded: false
        }
    }



    componentDidMount() {
        this._isMounted = true;
        fetch("/api/horizon")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {      
                    this.setState({
                        deviceId:result.id,
                        aboveHorizon: result.properties.astral.above_horizon,
                        astralTimeDigit: result.properties.astral.next_time.number,
                        astralTimeDigitUnit: result.properties.astral.next_time.unit,
                        astralNext: result.properties.astral.next_astral,
                        dataLoaded: true
                    });
                }     
                socket.on(this.state.deviceId, data => {
                    // console.log(data);
                    if (this._isMounted) {
                        this.setState({
                            aboveHorizon: data.properties.astral.above_horizon,
                            astralTimeDigit: data.properties.astral.next_time.number,
                            astralTimeDigitUnit: data.properties.astral.next_time.unit,
                            astralNext: data.properties.astral.next_astral,
                            dataLoaded: true
                        });
                    }
                }); 
               
            })
            .catch((error) => {
                console.error(error)
            })

    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        let data = this.state;
        if (data.dataLoaded == true) {
            return (
                <div className={`card mt-4 mb-4 ${this.state.aboveHorizon == "true" ? "card-warning " : "card-default"}`}>
                    <div className="card-body">
                        <span className={`icon-2x icon-left ${this.state.aboveHorizon == "true" ? "icon-sunrise " : "icon-moon"}`}></span>
                        <h2 className="mt-1">{this.state.aboveHorizon == "true" ? ("Above Horizon") : ("Below Horizon")}</h2>
                        <span className="text-secondary title-case">{this.state.astralNext} in Next {this.state.astralTimeDigit} {this.state.astralTimeDigitUnit}</span>
                        <div className="clearfix"></div>
                    </div>
                </div>
            )
        }
        return (null)
    }
}