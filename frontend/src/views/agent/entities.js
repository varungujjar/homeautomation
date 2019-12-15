import React, { Component } from "react";
import ReactDOM from 'react-dom';

import { Link, Redirect } from 'react-router-dom';
import { Header } from "../common/header";
import { TabHeads } from "./index";
import { Notification } from "../../system/notifications";
import { Formik } from 'formik';
import { Form } from "../../system/formelements";
import { WithContext as ReactTags } from 'react-tag-input';



export class Entities extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list: [],
            dataLoaded: false,
            trainStatus:false,
        }
    }

    
    

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            fetch("/api/entities")
                .then(response => response.json())
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({
                            list: result.sort((a, b) => b.id - a.id),
                            dataLoaded: true
                        });
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }

    deleteItem = (itemId) => {
        if (this._isMounted) {
        fetch(`/api/entities/${itemId}/delete`, {
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
                    Notification("default","Delete","Entity Deleted Successfully")
                }else{
                    Notification("error","Delete","There was an error deleting")
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
            <div className={`tab-pane fade ${this.props.active ? "show active" :""}`} id="entities" role="tabpanel" aria-labelledby="entities-tab">
                <div className="mt-4 border-rounded">
                <Link to={{ pathname: `/agent/entities/0`, data: null }} className="btn btn-info mb-4"><i className="fas fa-plus"></i></Link>

                {
                    this.state.dataLoaded ?
                        (
                            this.state.list.map((item, index) => {
                                return (
                                    
                                            <div className="p-all-less list-item" key={index}>
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="p-all-less">
                                                            <span className="icon-1x icon-bg-success text-bold icon-left">{item.name.charAt(0)}</span>
                                                            <div className="text-bold">{item.name ? item.name : "..."} <span className="text-secondary"></span></div>
                                                            <div><span className="text-secondary">{item.entity_values ? item.entity_values.length : ""} Classifications</span> </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 text-right v-center">
                                                    </div>
                                                    <div className="col-md-4 text-right v-center">
                                                        <div className="action-buttons">
                                                            <Link to={{ pathname: `/agent/entities/${item.id}` }} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>
                                                            <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteItem(item.id)}></span>
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



export class EntitiesEdit extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            dataLoaded: false,
            data:{
                id:0,
                name:"",
                entity_values:[]
            }
        }
        this.handleAddition = this.handleAddition.bind(this);
        this.addEntityValue = this.addEntityValue.bind(this);
    }

    addIndexMap = (ruleCondition) => {
        let result = [];
        var mergeJSON = require("merge-json");               
        ruleCondition.map((conditionItem, index)=>{
            const addIndex = {"indexMap":index}
            var dataMerged = mergeJSON.merge(addIndex, conditionItem);
            result[index]= dataMerged
        })
        return result;
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            if (this.props.match.params.id != 0) {
                fetch(`/api/entities/${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                            this.setState({
                                dataLoaded: true,
                                data:{
                                    id:result.id,
                                    name:result.name,
                                    entity_values:this.addIndexMap(result.entity_values)
                                }
                            })
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            } else {
                this.setState({
                    dataLoaded: true,
                    allLoaded:true
                })
            }
        }
    }

    handleDelete (i,indexMap) {
        const entities = [];
        this.state.data.entity_values.map((entity, index)=>{
            if(entity.indexMap === indexMap){
                   entity.synonyms.splice(i,1);
            }
            entities[index] = entity;
        })
        this.setState(prevState => ({ 
            data:{
                ...prevState.data,
                entity_values:entities
            }
     }));
      }
    

    handleAddition(tag,indexMap) {
        const entities = [];
        this.state.data.entity_values.map((entity, index)=>{
            if(entity.indexMap === indexMap){
                   entity.synonyms.push(tag.text);
            }
            entities[index] = entity;
        })
        this.setState(prevState => ({ 
            data:{
                ...prevState.data,
                entity_values:entities
            }
     }));
    }

    addEntityValue = () => {
        const entityTemplate = {
            indexMap:this.state.data.entity_values.length,
            value:"",
            synonyms:[]
        }
        this.setState(prevState => ({
            data:{
                ...prevState.data,
                entity_values:[...this.state.data.entity_values, entityTemplate]
            } 
        }));
    }

    deleteEntityValue = (indexMap) => {
        let entities = [];
        this.state.data.entity_values.map((entity, index)=>{
            if(entity.indexMap != indexMap){
                entities = [...entities, entity ];
            }
            
        })
        this.setState(prevState => ({ 
            data:{
                ...prevState.data,
                entity_values:entities
            }
     }));
    }


    cleanFormData = (formValues) => {
        let result = {};
        result["id"]= formValues.id;
        result["name"]= formValues.name;
        let entity_values = []
        formValues.entity_values.map((entity,index) => {
            let createEntity = {}
            Object.keys(entity).map((key,index)=>{
                if(key!="indexMap"){
                    createEntity[key] = entity[key]
                }
            })
            entity_values[index] = createEntity;
        })
        result["entity_values"] = entity_values;
        return result;
    }



    saveFormData = (data) => {
        console.log(data);
        fetch(`/api/entities/${this.state.data.id}/save`, {
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
                    Notification("success","Saved","Entity Saved Successfully")
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
                <Header name="Entities" icon="fal fa-atom"></Header>
                <div className="wrapper">
                <TabHeads active="entities" disabled="1" />

                {
                    this.state.dataLoaded && (
                        <Formik
                            enableReinitialize
                            initialValues={this.state.data}
                            // validate={}
                            onSubmit={(values, { setSubmitting }) => {
                                const getCleanFormData = this.cleanFormData(values);
                                this.saveFormData(getCleanFormData);
                                setSubmitting(false);
                            }}
                            handleChange={(event) => {}}
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
                                            Edit Entity
                                            </div>
                                            <div className="card-body">
                                            <input className="form-control" value={values.id} name="id" onChange={handleChange} type="hidden" />
                                            <input className="form-control" value={values.name} name="name" onChange={handleChange} type="text" />
                                            {    
                                                values.entity_values.length > 0 ?
                                                values.entity_values.map((entity,index) => {

                                                    const KeyCodes = {
                                                        comma: 188,
                                                        enter: 13,
                                                    };
                                                    
                                                    const delimiters = [KeyCodes.comma, KeyCodes.enter];
                                                        
                                                    let tags_create = [];
                                                    entity.synonyms.map((name,index)=>{
                                                        const tag = {"id":String(index),"text":name}
                                                        tags_create = [].concat(tags_create, tag);
                                                    })
                                                
                                                    return (
                                                        <div className="row mt-2" key={index}>
                                                            <div className="col-md-3">
                                                                <input 
                                                                className="form-control"
                                                                value={entity.value} 
                                                                name="" 
                                                                onChange={(e) => {
                                                                    values.entity_values[index].value = e.target.value;
                                                                    setFieldValue(values.entity_values[index].value)}
                                                                } 
                                                                type="text" />
                                                            </div>
                                                            <div className="col-md-6">
                                                            <ReactTags
                                                                tags={tags_create}
                                                                allowDragDrop={false}
                                                                delimiters={delimiters}
                                                                handleDelete={(i) => {
                                                                    this.handleDelete(i, entity.indexMap);
                                                                }}
                                                                handleAddition={(tags) => {
                                                                    this.handleAddition(tags,entity.indexMap);
                                                                }}
                                                                />

                                                            </div>
                                                            <div className="col-md-3"><button className="btn btn-info" onClick={() => this.deleteEntityValue(entity.indexMap)} type="button">Delete</button></div>
                                                        </div>
                                                    )
                                               })
                                               : null
                                            }  

                                            <button className="btn btn-info" onClick={() => this.addEntityValue()} type="button">+ Add</button>

                                            </div>
                                            <div className="card-footer">

                                            <div className="btn-group">

                                            <button type="submit" disabled={isSubmitting} className={`btn btn-info`}>
                                            <i className="fas fa-check-circle"></i> Save Entity
                                            </button>

                                            <Link to={{ pathname: `/agent/entities`, data: null }} className="btn btn-default">Cancel</Link>
                                            </div>
                                            </div>
                                        </div>
                                    </form>
                                )}
                        </Formik>
                    )
                }
            </div>
            </>
        )
    }
}
