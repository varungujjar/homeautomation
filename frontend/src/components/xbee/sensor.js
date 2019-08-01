import React, { Component } from "react";
import { DeviceModal } from "../../views/common/devicemodal";

export const ModuleModal = (props) => {
    const data = props.data;
    const properties = data.properties;
    return(
        <>
            
        </>
    )
}


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;    
        this.defaultIfAndProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": {"temperature":{"value":this.props.data.properties.temperature.value}}}
        if(this.props.values){
            this.deviceValues = this.props.values;
        }
        this.state = {
            edit:false
        }     
        this.deviceData = this.props.data;
        if(this.deviceValues){
            this.state = {
                selectedProperty:Object.keys(this.deviceValues.properties)[0] ? Object.keys(this.deviceValues.properties)[0] : Object.keys(this.deviceData.properties)[0],
            }
        }

        this.allowedValues = {
            "temperature":"Temperature",
            "humidity":"Humidity",
            "pressure":"Pressure",
            "light":"Light",
            "gas":"Gas",
            "voltage":"Voltage"
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
        }
    }    

    onConditionChange = (event) => {
        const selectedCondition = event.currentTarget.value;
        this.deviceValues.condition = selectedCondition;
        this.props.setFieldValue(this.deviceValues.condition)
    } 


    onPropertyChange = (event) => {
        const selectedProperty = this.state.selectedProperty;
        this.deviceValues.properties[selectedProperty].value = parseFloat(event.currentTarget.value);
        this.props.setFieldValue(this.deviceValues.properties[selectedProperty].value)
    }

    
    onSelectProperty = (selectedProperty) => {
        this.setState({
            selectedProperty: selectedProperty.currentTarget.value
        })
        const selectedPropertyChange = selectedProperty.currentTarget.value
        this.deviceValues.properties = {};//empty all properties before writing new one
        this.props.setFieldValue(this.deviceValues.properties);
        
        this.deviceValues.properties[selectedPropertyChange] = {"value":parseFloat(this.deviceData.properties[selectedPropertyChange].value)}
        this.props.setFieldValue(this.deviceValues.properties[selectedPropertyChange])
    }
    
    
    componentWillUnmount() {
        this._isMounted = false;
    }


    render(){
        return (
                <div>
                    <div className={`card card-outline-default ${this.deviceValues && !this.state.edit ? "has-edit-hover" : ""}`}>
                    <div className="edit-overlay v-center" onClick={() => this.setState({ edit: true })}>
                        <span className="text-lg icon-1x icon-edit"></span>
                    </div>
                    {      
                            <div className="p-all-less">
                            <span className={`icon-left icon-1x icon-bg-info icon-${this.deviceData.icon ?  this.deviceData.icon : ""}`}></span>
                            <div className="text-bold mt-1">{this.deviceData.name ? this.deviceData.name : "..."}</div>
                            <div className="text-secondary">{this.deviceData.room_name ? this.deviceData.room_name : "..."}</div>
                            </div>
                     }
                     { 
                            this.deviceValues && this.deviceValues.properties &&      
                            <div className="p-all-less b-t">
                                {
                                    Object.keys(this.deviceValues.properties).map((key,index)=>{
                                           return(
                                                <div key={index}>
                                                <span className="badge badge-default"><i className="fab fa-codepen"></i> <b>{key.charAt(0).toUpperCase() + key.slice(1)}</b> {Object.values(this.deviceValues.properties)[index].value ? Object.values(this.deviceValues.properties)[index].value : 0} </span>
                                                </div>

                                           ) 
                                    })

                                }
                            </div>

                        }
                            
                           


                        {
                            this.deviceValues && this.state.edit &&   
                            (() => {
                            if (this.props.dataType == "if" || this.props.dataType == "and") {
                                return (
                                    <>
                                        <div className="p-all-less">                                        
                                        <div className="row">
                                        <div className="col-md-8">
                                            <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty} className="form-control">
                                            {    
                                                Object.keys(this.deviceData.properties).map((property, index) => {
                                                    if(property in this.allowedValues){
                                                        return (
                                                            <option value={`${property}`} key={index}>{this.allowedValues[property]}</option>
                                                        )
                                                    }
                                                })
                                            }
                                        </select></div>
                                            <div className="col-md-4">  
                                            <select className="form-control" name={`${this.props.dataType}[condition]`} value={this.deviceValues.condition} onChange={this.onConditionChange}>
                                            <option value="=">=</option>
                                            <option value=">">&gt;</option>
                                            <option value="<">&lt;</option>
                                        </select></div>
                                        </div>
                                        {
                                            this.state.selectedProperty ?
                                                (
                                                    <input className="form-control mt-3" value={ this.deviceValues.properties[this.state.selectedProperty].value? this.deviceValues.properties[this.state.selectedProperty].value : ""} name={`${this.props.dataType}[properties][${this.state.selectedProperty}][value]`} onChange={this.onPropertyChange} type="number" />
                                                )
                                                : null
                                        }
                                         </div>
                                         <div className="card-footer bg-dark text-center b-t"><span className="link" onClick={() => this.setState({ edit: false })}>Done</span>    </div>

                                    </>
                                )
                            } 
                        })()}
                            
                            
                        
                   
                            {
                                this.props.addDefaultProperties && ( this.props.dataType == "if" || this.props.dataType == "and" )&& (
                                    <button  className="text-lg icon-bg-light icon-shadow icon-1x icon-add float-right" type="button" variant="primary" onClick={() => {this.props.addDefaultProperties(this.defaultIfAndProperties)}}></button>
                                )
                            }
                            
                        {
                            this.deviceValues && !this.state.edit && (
                                <button className="text-lg icon-bg-light icon-shadow icon-1x icon-remove float-right" type="button" variant="primary" onClick={() => {this.props.deleteDefaultProperties(this.props.indexMap, this.props.dataType)}}></button>
                            ) 
                        }
                    </div>
                </div>
            )
    }
}




export const Module = (props) => {
    const device = props.data;
    return (
        <div className="slider-slide">
            <div className={`card card-module-height card-shadow item ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                         <DeviceModal data={device}/> 
                        <div className="text-status text-1x text-white">{Number(device.properties.temperature.value).toFixed(1)}<span className="text-normal text-secondary">°{device.properties.temperature.unit}</span></div>
                        <div className="text-white mt-2">{device.name ? device.name : "..."}</div>
                        <div className="text-secondary">{device.room_name ? device.room_name : "..."}</div>
                        <div className="clearfix"></div>
                
                </div>
            </div>
        </div>
    )
}