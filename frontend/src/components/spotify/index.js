import React, {Component} from "react";
import { socket } from "../../system/socketio";
import { DeviceModal } from "../../views/common/devicemodal";


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.defaultThenProperties = {"type": "component", "condition": "=", "id": this.props.data.id, "properties": {'playlist':''}};
        if(this.props.values){
            this.deviceValues = this.props.values;
        }
        this.state = {
            edit:false
        }   
        this.deviceData = this.props.data;
        if(this.deviceValues){
            this.state = {
                selectedProperty:"playlist",
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
                <div className={`card card-outline-default ${this.deviceValues && !this.state.edit ? "has-edit-hover" : ""}`}>
                    <div className="edit-overlay v-center" onClick={() => this.setState({ edit: true })}>
                        <span className="text-lg icon-1x icon-edit"></span>
                    </div>
                    {
                        
                            <div className="p-all-less">
                                <span className={`icon-1x icon-left icon-spotify icon-bg-success`}></span>
                                <div className="text-bold">Spotify</div>
                                <div className="text-secondary">
                                    Plays Playlist
                                </div>
                            </div>
                    }
                    {
                        this.deviceValues && this.state.edit &&
                        (() => {
                            if (this.props.dataType == "then" ){
                                return (
                                    <>
                                        <div className="p-all-less">
                                            <select name="" value={this.state.selectedProperty} onChange={this.onSelectProperty} className="form-control">
                                                <option value="false">Playlist</option>
                                            </select>
                                        </div>
                                        <div className="card-footer bg-dark text-center b-t"><span className="link" onClick={() => this.setState({ edit: false })}>Done</span></div>
                                    </>
                                )
                            }
                        })()
                    }
                    {
                        this.props.addDefaultProperties && this.props.dataType == "then" && (
                            <button type="button" className="text-lg icon-bg-light icon-shadow icon-1x icon-add float-right" variant="primary" onClick={() => { this.props.addDefaultProperties(this.defaultThenProperties) }}></button>
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

