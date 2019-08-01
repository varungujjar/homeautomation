import React, { Component } from "react";
import { Header } from "../common/header";
import Moment from 'react-moment';
import renderHTML from 'react-render-html';
import {sio} from "../../system/socketio";
import { Notification } from "../../system/notifications";


const convertTime = (datetime) => {
    var var_datetime = new Date(datetime);
    return <Moment format="hh:mm A">{var_datetime}</Moment>
}

const convertAgo = (datetime) => {
    var var_datetime = new Date(datetime);
    return <Moment fromNow ago>{var_datetime}</Moment>
}

export class Timeline extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list:[],
            dataLoaded:false
        }
    }


    renderList = () => {
        if (this._isMounted) {
        fetch("/api/notifications")
            .then(response => response.json())
            .then((result) => {
                
                    this.setState({
                        list: result.sort((a, b) => b.id - a.id),
                        dataLoaded: true
                    });
                
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }


    clearAll = () => {
        this._isMounted = true;
        if (this._isMounted) {
            fetch("/api/notifications/delete", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(1)
            })
                .then((result) => {
                    if(result!==false){
                        Notification("default","Deleted","Notifications Deleted Successfully")
                        this.setState({
                            list:[],
                            dataLoaded: true
                        });
                    }else{
                        Notification("error","Error","There was an Error Deleting Notifications")
                    }
                        
                })
                .catch((error) => {
                    console.error(error)
                })
            }
    }

    componentDidMount() {
        this._isMounted = true;
        this.renderList();
        sio("notification",data=>{
            if (this._isMounted) {
                this.renderList();
            }
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        let data = this.state;
        let icon = "";

        if (data.dataLoaded == true && data.list.length > 0) {
            return (
                <>
                    <Header name={this.props.name} icon={this.props.icon}></Header>
                    <div className="wrapper">
                    <div className="mb-3">
                        <button className="btn btn-default mb-3" onClick={()=>this.clearAll()}><i className="fas fa-trash"></i> Clear All</button>
                        <div className="clearfix"></div>
                    </div>

                    <div className="timeline">
                    
                    {
                         
                        data.list.map((item, index) => {
                            {
                                
                                
                                if (item.class == "success") {
                                    icon = "icon-check";
                                }
                                if (item.class == "error") {
                                    icon = "icon-error";
                                }
                                if (item.class == "info") {
                                    icon = "icon-info";
                                }
                                if (item.class == "default") {
                                    icon = "icon-check";
                                }
                            }
                            return (

                                <div className="timeline-container mt-3">
                                    <div className="time-cont text-right">
                                        <span className="badge badge-info mb-2"><i className="fa fa-clock"></i> {convertTime(item.created)}</span>  
                                        <div className="clearfix"></div>  
                                        <span className="text-secondary">{convertAgo(item.created)} ago</span>
                                    </div>
                                    <div className="dot-cont">
                                        <span className="dot-1x"></span>

                                    </div>
                                    <div className={`content-cont`}>
                                    
                                    <div className={`card card-shadow b-l-${item.class ? item.class : "info"} `}>
                                    <div className="card-body">
                                    
                                    <span className="text-secondary">{item.title}</span>
                                    <div className="text-sm"><span className={`text-light ${icon}`}></span>&nbsp;{renderHTML(item.message)}</div>
                                    </div>
                                    </div>
                                </div>
                                
                               
                                <div className="clearfix"></div>
                                </div>
                                )
                        })
                    }
                    </div>
                </div>
                </>
            )
        }
        else{
            return (
                <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                <div className="wrapper">
                <div className="text-center p-all"><i className="fa fa-info-circle text-muted"/> No Notifications Yet.</div>
            </div>
            </>
            )
        }

        return (
            null
        )

        
    }
}
