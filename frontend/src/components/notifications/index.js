import React, {Component} from "react";
import {sio} from "../../system/socketio";
import Moment from 'react-moment';


export class OverlayNotification extends Component  {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            messages:[],
            dataLoaded :false
        }
    }

    convertAgo(datetime){
        var var_datetime = new Date(datetime);
        return <Moment fromNow ago>{var_datetime}</Moment>
    }


    getData() {
        fetch("/api/notifications/read/0")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                        this.setState({
                            messages:result.sort((a, b) => b.id - a.id),
                            dataLoaded :true
                        })
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    readMessage(id){
        fetch(`/api/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(1)
        })
        .then(response => response.json())
        .then(() => {
            this.getData();
        })
        .catch((error) => {
            console.error(error)
        })
    }


    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) { 
            this.getData();
            setInterval(() => {
                this.getData();
            }, 1000)    
            sio("OverlayNotification",data=>{
                 this.getData();
            })
        }
    }
    
    
    render(){ 
            return (
                <>
                {
                    this.state.dataLoaded && 
                        this.state.messages.map((message,index)=>(
                                <div className="overlay-notification " key={index}>
                                    <div className="overlay-notification-icon animated fadeIn"><i className="fal fa-envelope text-info"></i></div>
                                    <div className="overlay-notification-title animated fadeIn">{message.title?message.title:""}</div>
                                    <div className="overlay-notification-message text-secondary animated fadeIn">{message.message?message.message:""}</div>
                                    <div className="text-md mt-3"><i className="far fa-clock animated fadeIn"></i> {this.convertAgo(message.created)} ago</div>
                                    <button className="btn btn-info mt-3 animated fadeIn" onClick={()=>this.readMessage(message.id)}>Close Message</button>
                                </div>
                        )
                    )
                }
            </>
            )
    }
}



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
                <div className={`card card-outline-default ${this.deviceValues && !this.state.edit ? "has-edit-hover" : ""}`}>
                    <div className="edit-overlay v-center" onClick={() => this.setState({ edit: true })}>
                        <span className="text-lg icon-1x icon-edit"></span>
                    </div>
                    {      
                            <div className="p-all-less">
                            <span className="icon-left icon-1x icon-bg-info icon-bell"></span>
                            <div className="text-bold mt-1">Notification</div>
                            <div className="text-secondary">Message</div>
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
                                        <div className="card-footer bg-dark text-center b-t"><span className="link" onClick={() => this.setState({ edit: false })}>Done</span></div>
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

