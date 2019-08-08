import React, {Component} from "react";
import { socket } from "../../system/socketio";
import { DeviceModal } from "../../views/common/devicemodal";


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.defaultThenProperties = {"type": "component", "condition": "=", "id": this.props.data.id, "properties": {'message':''}};
        if(this.props.values){
            this.deviceValues = this.props.values;
        }
        this.state = {
            edit:false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
        }
    }    

    onMessageChange = (event) => {
        const Message = event.currentTarget.value;
        this.deviceValues.properties.message = Message;
        this.props.setFieldValue(this.deviceValues.properties.message)
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
                                <span className={`icon-1x icon-left icon-tts icon-bg-info`}></span>
                                <div className="text-bold">Google Cloud</div>
                                <div className="text-secondary">
                                {this.deviceValues && this.deviceValues.properties.message ? this.deviceValues.properties.message : "Text To Speech"}
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
                                    <input className="form-control mt-3" value={this.deviceValues.properties.message} name={`${this.props.dataType}[properties][message]`} onChange={this.onMessageChange} placeholder="Message" />
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

