import React, {Component} from "react";
import { socket } from "../../system/socketio";


export class ModuleList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.defaultThenProperties = {"type": "component", "condition": "=", "id": this.props.data.id, "properties": {"title":"","message":""}}
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


    onTitleChange = (event) => {
        const Title = event.currentTarget.value;
        this.deviceValues.properties.title = Title;
        this.props.setFieldValue(this.deviceValues.properties.title)
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
                <div className={`card card-outline-default h-100 ${this.deviceValues && !this.state.edit ? "has-edit-hover" : ""}`}>
                    <div className="edit-overlay v-center" onClick={() => this.setState({ edit: true })}>
                        <span className="text-lg icon-1x icon-edit"></span>
                    </div>
                    {      
                            <div className="p-all-less">
                            <span className="icon-left icon-1x icon-bg-warning icon-bell"></span>
                            <div className="text-bold mt-1">Notification</div>
                            <div className="text-secondary text-md">Message</div>
                            </div>
                     }
                     { 
                        this.deviceValues ? (
                        <div className="p-all-less b-t">
                            <div>
                                <span className="badge badge-default mr-1 mb-1"><i className="fab fa-codepen"></i> <b>Title</b> {Object.values(this.deviceValues.properties.title)} </span>
                                <span className="badge badge-default mr-1 mb-1"><i className="fab fa-codepen"></i> <b>Message</b> {Object.values(this.deviceValues.properties.message)} </span>
                            </div>
                        </div>
                        ) : null

                        }
                    {
                        this.deviceValues && this.state.edit &&

                        (() => {
                            if (this.props.dataType == "then" ) {
                                return (
                                    <>
                                        <div className="p-all-less">
                                        <input className="form-control mt-3" value={this.deviceValues.properties.title} name={`${this.props.dataType}[properties][title]`} onChange={this.onTitleChange} placeholder="Title" />
                                        <input className="form-control mt-3" value={this.deviceValues.properties.message} name={`${this.props.dataType}[properties][message]`} onChange={this.onMessageChange} placeholder="Message" />
                                        </div>
                                        <span className="link w-100 b-t" onClick={() => this.setState({ edit: false })}>Done</span>
                                    </>
                                )
                            }
                        })()
                    
                    }

                    {
                        this.props.addDefaultProperties && this.props.dataType == "then" && (
                            <button className="text-lg icon-bg-light icon-shadow icon-1x icon-add float-right" type="button" variant="primary" onClick={() => {this.props.addDefaultProperties(this.defaultThenProperties)}}></button>
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

