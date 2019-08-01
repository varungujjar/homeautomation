import React, { Component } from "react";
import { Header } from "../common/header";
import { TabHeads } from "./index";
import { Link, Redirect } from 'react-router-dom';


export class Devices extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list : [],
            dataLoaded: false
        }
    }



    componentDidMount() {
        this._isMounted = true;
        if(this._isMounted){
            fetch("/api/devices")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        list:result,
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
       return(
        <div className={`tab-pane fade ${this.props.active ? "show active" : null}`} id="devices" role="tabpanel" aria-labelledby="devices-tab">
        <div className="mt-4">
            <h2 className="mb-3">Discovered Devices</h2>
            <div className="text-muted mb-5">Any new devices will automatically show up here.</div>
            
            <h2 className="mb-3">Devices</h2>
            <div className="row">
            {
                this.state.dataLoaded ? 
                (   
                                    this.state.list.map((item,index)=>{
                                    return(
                                         
                                        <div className="col-md-4"  key={index}>
                                         <div className="card card-shadow mt-3 border-rounded">

                                         <div className="card-body">
                                         <span className={`icon-1x icon-left icon-bg-default icon-${item.icon ? item.icon : ""}`}></span>
                                                        <div className="text-bold">{item.name?item.name:"..."}</div>
                                                        <div className="text-secondary">{item.room_name?item.room_name:"..."}</div>
                                                        <div className="text-secondary">{item.description?item.description:"..."}</div>
                                             </div>


                                                   
                                           
                                          
                                                        <div className="card-footer text-center">
                                            <Link to={{ pathname: `/settings/rooms/${item.id}`}} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>

                                            {/* <span className={`btn-action icon-1x icon-bg-default text-bold ${item.published ? "icon-publish text-success" :"icon-unpublish text-muted"}`} onClick={() => this.togglePublished(item.id, item.published)}>
                                            </span> */}
                                            <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRule(item.id)}>     
                                            </span> 

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
    </div>
       )
           
    }


}


export class DevicesEdit extends Component {
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
                   <TabHeads active="Devices" disabled="1"/>
                   Device Edit
            </>
        )
    }
}




