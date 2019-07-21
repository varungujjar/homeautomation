import React, { Component } from "react";
import { Header } from "../common/header";
import { TabHeads } from "./index";
import { Link, Redirect } from 'react-router-dom';
import { Notification } from "../../system/notifications";
import { Formik } from 'formik';
import { Roomicons } from "../../system/icons";

export class Rooms extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list : [],
            dataLoaded: false
        }
    }

    deleteRoom = (roomId) => {
        if (this._isMounted) {
        fetch(`/api/rooms/${roomId}/delete`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(1)
            })
            .then(response => response.json())
            .then((result) => {
                if(result!==false){
                    this.setState({
                        list:[]
                    })
                    this.setState({list:result.sort((a, b) => b.id - a.id), dataLoaded:true});  
                    Notification("default","Delete","Room Deleted Successfully")
                }else{
                    Notification("error","Delete","There was an error deleting")
                }

                
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }



    componentDidMount() {
        this._isMounted = true;
        if(this._isMounted){
            fetch("/api/rooms")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        list:result.sort((a, b) => b.id - a.id),
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
        <div className={`tab-pane fade ${this.props.active ? "show active" : null}`} id="rooms" role="tabpanel" aria-labelledby="room-tab">
        <div className="mt-4">
        <Link to={{ pathname: `/settings/rooms/0`, data: null }} className="btn btn-info mb-4"><i className="fas fa-plus"></i> Add Room</Link>
            {
                this.state.dataLoaded ? 
                (   
                                
                                this.state.list.map((item,index)=>{

                                    return(
                                        <div className="p-all-less list-item" key={index}>
                                        <div className="row">          
                                                <div className="col-md-5">
                                                    <div className="p-all-less">
                                                    <span className={`icon-2x icon-left icon-${item.icon ? item.icon : ""}`}></span>
                                                        <div className="text-bold">{item.name?item.name:"..."}</div>
                                                        <div className="text-secondary">{item.description?item.description:"..."}</div>
                                                        </div>
                                                </div>
                                           
                                            <div className="col-md-3 text-right v-center">
                                               
                                            </div>
                                            <div className="col-md-4 text-right v-center">
                                            <div className="action-buttons">
                                            <Link to={{ pathname: `/settings/rooms/${item.id}`}} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>

                                            {/* <span className={`btn-action icon-1x icon-bg-default text-bold ${item.published ? "icon-publish text-success" :"icon-unpublish text-muted"}`} onClick={() => this.togglePublished(item.id, item.published)}>
                                            </span> */}
                                            <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRoom(item.id)}>     
                                            </span> 

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


export class RoomsEdit extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {  
            dataLoaded: false,
        }
        this.initialValues = {
            "id": 0,
            "name": "",
            "description": "",
            "icon": "",
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            if (this.props.match.params.id != 0) {
                fetch(`/api/rooms/${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                            this.initialValues = result;
                            this.setState({
                                dataLoaded: true,
                            })          
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            } else {
                this.setState({
                    dataLoaded: true,
                }) 
            }
        }
    }

    

    saveFormData = (data) => {
        // console.log(data);
        fetch(`/api/rooms/${this.initialValues.id}/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((result) => {
                if(result!==false){
                    Notification("success","Saved","Room Saved Successfully")
                }else{
                    Notification("error","Error","There was an error saving")
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }



    render() {
        return (
            <>
                <Header name="Settings" icon="fal fa-cog"></Header>
                <TabHeads active="rooms" disabled="1" />
                {
                    this.state.dataLoaded && (
                        <Formik
                            // enableReinitialize
                            initialValues={this.initialValues}
                            // validate={}
                            onSubmit={(values, { setSubmitting }) => {
                                this.saveFormData(values)
                                setSubmitting(false);
                            }}
                            handleChange={(event) => {
                                console.log(event);
                            }}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                setFieldValue,
                                handleSubmit,
                                isSubmitting,
                            }) => (
                                    <form onSubmit={handleSubmit}>
                                       
                                        <div className="card card-shadow mt-3">
                                        <div className="card-header">
                                            <h2>Edit Room</h2>
                                            </div>
                                            <div className="card-body">
                                                <input className="form-control " value={values.id} name="name" onChange={handleChange} type="hidden" />
                                                <div className="form-group">
                                                    <input className="form-control" value={values.name} name="name" onChange={handleChange} placeholder="Room Name"/>
                                                </div>
                                                <div className="form-group">
                                                    <textarea className="form-control mt-3" value={values.description} name="description" onChange={handleChange} placeholder="Room Description"/>
                                                </div>
                                                <select name="icon" value={values.icon} onChange={handleChange} className="form-control">
                                                    <option value="">Select an Icon</option>
                                                    {
                                                        Object.keys(Roomicons).map((room, index) => {
                                                            return (
                                                                <option value={`${room}`} key={index}>{Object.values(Roomicons)[index]}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            <div className="card-footer">
                                            <button type="submit" disabled={isSubmitting} className="btn btn-info mb-2 mt-2">
                                            <i className="fas fa-check-circle"></i> Save Room
                                    </button>
                                        <Link to={{ pathname: `/settings/rooms`, data: null }} className="mb-4 text-muted ml-4">Cancel</Link>
                                            </div>
                                        </div>
                                    </form>
                                )}
                        </Formik>
                    )
                }
            </>
        )
    }
}




