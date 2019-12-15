import React, {Component} from "react";
import { DeviceModal } from "../../views/common/devicemodal";


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.defaultIfAndProperties = {"type": "device", "condition": "=", "id": this.props.data.id, "properties": {"online":0}};
        this.deviceData = this.props.data;
        if(this.props.values){
            this.deviceValues = this.props.values;
        }
        this.state = {
            edit:false
        }   
       
        if(this.deviceValues){
            this.state = {
                selectedProperty:this.deviceValues.properties.online ? this.deviceValues.properties.online : this.deviceData.properties.online,
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
            selectedProperty: parseInt(selectedProperty.currentTarget.value)
        })
        this.deviceData.properties.online = parseInt(selectedProperty.currentTarget.value)
        this.deviceValues.properties.online = parseInt(selectedProperty.currentTarget.value);
        this.props.setFieldValue(this.deviceValues.properties.online)
       
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
                                <span className={`icon-1x icon-left ${this.deviceData.properties.online == 1 ? "icon-bg-info icon-beacon" : "icon-bg-dark icon-beacon"}`}></span>
                                <div className="text-bold">Eddystone Beacon</div>
                                <div className="text-secondary">
                                    {this.deviceData.properties.online == 1 ? ("In Range") : ("Out Of Range")}
                                </div>
                            </div>
                    }
                    {
                        this.deviceValues && this.state.edit &&
                        (() => {
                            if (this.props.dataType == "if" || this.props.dataType == "and") {
                                return (
                                    <>
                                        <div className="p-all-less">
                                            <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty} className="form-control">
                                                <option value="1">In Range</option>
                                                <option value="0">Out of Range</option>
                                            </select>
                                        </div>
                                        <div className="card-footer bg-dark text-center b-t"><span className="link" onClick={() => this.setState({ edit: false })}>Done</span></div>
                                    </>
                                )
                            }
                        })()
                    }
                    {
                        this.props.addDefaultProperties && (this.props.dataType == "if" || this.props.dataType == "and") && (
                            <button type="button" className="text-lg icon-bg-light icon-shadow icon-1x icon-add float-right" variant="primary" onClick={() => { this.props.addDefaultProperties(this.defaultIfAndProperties) }}></button>
                        )
                    }
                    {
                        this.deviceValues && !this.state.edit && (
                            <button type="button" className="text-lg icon-bg-light icon-shadow icon-1x icon-remove float-right" variant="primary" onClick={() => { this.props.deleteDefaultProperties(this.props.indexMap, this.props.dataType) }}></button>
                        )
                    }
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
            <div className={`card card-module-height card-shadow item`}>
                <div className="card-body">
                        <DeviceModal data={device}/> 
                        <span className={`icon-1x icon-bg-default ${device.online ? "icon-bg-info icon-beacon" : "icon-bg-dark icon-beacon"}`}></span>
                        <div className="text-white mt-2">{device.name ? device.name : "..."}</div>
                        <div className="text-secondary">{device.online ? ("In Range") : ("Out Of Range")}</div>
                        <div className="clearfix"></div>
                
                </div>
            </div>
        </div>
    )
}

