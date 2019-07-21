import React, { Component } from "react";
import { Link, Redirect } from 'react-router-dom';
import { Header } from "../common/header";
import { TabHeads } from "./index";



export class Components extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list: [],
            dataLoaded: false
        }
    }

    toggleEnable = (compId, enableState) => {
        if (this._isMounted) {
        fetch(`/api/components/${compId}/enable`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enableState ? 0 : 1)
            })
            .then(response => response.json())
            .then((result) => {
                        if(result!==false){  
                            const list = this.state.list.filter(item => item.id!= result.id).concat(result).sort((a, b) => a.id.localeCompare(b.id));
                            this.setState({
                                list:list
                            })
                            Notification(`${enableState ? "default" : "success"}`,`${enableState ? "Deactivated" : "Activated"}`,`${enableState ? "Component deactivated successfully" : "Component activated successfully"}`)
                        }else{
                            Notification("error","Activation","There was an error activating or deactivating")
                        }
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }


    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            fetch("/api/components")
                .then(response => response.json())
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({
                            list: result.sort((a, b) => a.id.localeCompare(b.id)),
                            dataLoaded: true
                        });
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }



    componentWillUnmount() {
        this._isMounted = false;
    }



    render() {
        return (
            <div className={`tab-pane fade ${this.props.active ? "show active" : null}`} id="components" role="tabpanel" aria-labelledby="components-tab">
                <div className="mt-4">
                {
                    this.state.dataLoaded ?
                        (
                            this.state.list.map((item, index) => {
                                return (
                                    
                                            <div className="p-all-less list-item" key={index}>
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="p-all-less">
                                                            <span className="icon-1x icon-bg-info text-bold icon-left">{item.name.charAt(0)}</span>
                                                            <div className="text-bold">{item.name ? item.name : "..."}</div>
                                                            <div className="text-secondary">{item.description ? item.description : "..."}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 text-right v-center">
                                                    </div>
                                                    <div className="col-md-4 text-right v-center">
                                                        <div className="action-buttons">
                                                            <Link to={{ pathname: `/settings/components/${item.id}` }} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>
                                                            <span className={`btn-action icon-1x icon-bg-default text-bold ${item.enable ? "icon-publish text-success" : "icon-unpublish text-muted"}`} onClick={() => this.toggleEnable(item.id, item.enable)}>
                                                            </span>
                                                            {
                                                                item.locked ? (
                                                                    <span className="btn-action-disabled icon-1x icon-bg-default icon-lock text-bold"></span>
                                                                ) : (
                                                                        <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRule(item.id)}></span>
                                                                    )
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                       
                                )
                            })
                        ) : (
                            <>
                                Nothing here
                    </>
                        )
                }
             </div>
        </div>
        )
    }
}



export class ComponentsEdit extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            dataLoaded: false,
        }
        this.id = 0;
    }
    render() {
        return (
            <>
                <Header name="Settings" icon="fal fa-cog"></Header>
                <TabHeads active="Components" disabled="1" />
                Here
            </>
        )
    }
}
