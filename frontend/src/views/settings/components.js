import React, { Component } from "react";
import { Link, Redirect } from 'react-router-dom';
import { Header } from "../common/header";
import { TabHeads } from "./index";
import { Notification } from "../../system/notifications";
import { Formik } from 'formik';
import { Form } from "../../system/formelements";

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
        this.initialValues = {
            "parameters":[],
            "id":null
        };
    }

    componentDidMount() {
        this._isMounted = true;
        console.log("relaoaded")
        if (this._isMounted) {
            if (this.props.match.params.id != 0) {
                fetch(`/api/components/${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                            this.initialValues.parameters = result.parameters;
                            this.initialValues.id = result.id;
                            this.setState({
                                dataLoaded: true,
                            })
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            } else {
                console.log("Cannot add a new parameter this way")
            }
        }
    }


    saveFormData = (data) => {
        console.log(data);
        fetch(`/api/components/${this.id}/save`, {
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
                    Notification("success","Saved","Component Saved Successfully")
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
                <TabHeads active="components" disabled="1" />
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
                                console.log("yay");
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
                                            <h2>Edit Component</h2>
                                            </div>
                                            <div className="card-body">
                                            <input className="form-control" value={values.id} name="id" onChange={handleChange} type="hidden" />
                                            <div className="row">
                                            {
                                                this.initialValues.parameters.length > 0 ?
                                                values.parameters.map((key,index)=>{
                                                    return(
                                                        <div key={index} className="col-md-6 mb-3">
                                                        <Form
                                                        value={values.parameters[index]["value"]}
                                                        type={values.parameters[index]["type"]}
                                                        handleChange={handleChange}
                                                        name={`parameters[${index}][value]`}
                                                        label={values.parameters[index]["label"] ? values.parameters[index]["label"] : values.parameters[index]["key"]}
                                                        ></Form>
                                                        </div>
                                                    )
                                                }) : (

                                                    <div className="col-md-12"><i class="fas fa-info-circle"></i> This component does not have any parameters.</div>
                                                )

                                            }  
                                            </div>
                                            </div>
                                            <div className="card-footer">
                                            <button type="submit" disabled={isSubmitting} className={`btn btn-info mb-2 ${this.initialValues.parameters.length > 0 ? '' : 'disabled'}`}>
                                            <i className="fas fa-check-circle"></i> Save Room
                                    </button>
                                        <Link to={{ pathname: `/settings/components`, data: null }} className="mb-4 text-muted ml-4">Cancel</Link>
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
