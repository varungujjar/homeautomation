import React, { Component } from "react";
import { Header } from "../common/header";
import Moment from 'react-moment';
import renderHTML from 'react-render-html';
import {sio} from "../../system/socketio";


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
        fetch("/api/notifications")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        list: result,
                        dataLoaded: true
                    });
                }
            })
            .catch((error) => {
                console.error(error)
            })
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
                .then(response => response.json())
                .then((result) => {
                    if(result!=="False"){
                        Notification("default","Deleted","Notifications Deleted Successfully")
                    }else{
                        Notification("error","Error","There was an error saving")
                    }
                        this.setState({
                            list: result,
                            dataLoaded: true
                        });
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
                    <div className="mb-3">
                        <button className="btn btn-default mb-3" onClick={()=>this.clearAll()}><i className="fas fa-trash"></i> Clear All</button>
                        <div className="clearfix"></div>
                    </div>
                    
                    {
                         
                        data.list.map((item, index) => {
                            {
                                
                                
                                if (item.type == "success") {
                                    icon = "icon-check";
                                }
                                if (item.type == "error") {
                                    icon = "icon-error";
                                }
                                if (item.type == "info") {
                                    icon = "icon-info";
                                }
                                if (item.type == "default") {
                                    icon = "icon-check";
                                }
                            }
                            return (
                                <div key={index} className="card card-shadow mt-3 overflow-hidden">
                                    <div className={`bg-${item.type ? item.type : "info"}  p-all-less float-left`}>
                                        <span className={`icon-1x text-light ${icon}`}></span>
                                    </div>
                                    <div className="float-left p-all-less">
                                        <div className="text-md mt-1">
                                            <span className="text-bold">{item.title}</span> &nbsp;
                                            {renderHTML(item.message)}
                                        </div>
                                        <span className="text-muted">{convertAgo(item.created)} ago at {convertTime(item.created)} </span>
                                    </div>
                                    <div className="clearfix"></div>
                                </div>)
                        })
                    }
                </>
            )
        }
        else{
            return (
                <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                <div className="text-center p-all"><i className="fa fa-info-circle text-muted"/> No Notifications Yet.</div>
            </>
            )
        }

        return (
            null
        )

        
    }
}
