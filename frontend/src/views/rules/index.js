import React, { Component } from "react";
import { Header } from "../common/header";
import { Link, Redirect } from 'react-router-dom';
import { GetDevice } from "../dashboard/devices";
import { AddDeviceModal } from "./adddevicemodal";
import { GetComponent } from "../../system/socketio"
import { Formik } from 'formik';
import { Notification } from "../../system/notifications";


export class Rules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ifComponents: [],
            ruleData:[],
            dataLoaded: false,
        }
    }


    renderItem = (item) => {
        const conditionData = item.rule_if;
        let devicesList = [];

        if (conditionData.length > 0) {
            conditionData.map((condition, index) => {
                const DataType = condition["type"]

                if (DataType == "device") {
                    GetDevice(condition["id"], data => {
                        import(`../../components/${data.component}/${data.type}`)
                            .then(component => {

                                var mergeJSON = require("merge-json");
                                var devicePropertiesMerged = { "properties": mergeJSON.merge(data.properties, condition.properties) };
                                var deviceDataMerged = mergeJSON.merge(data, devicePropertiesMerged);

                                const deviceData = {
                                    data: deviceDataMerged,
                                    component: component.ModuleList,
                                }

                               

                                devicesList.push(deviceData);

                                const ifComponentData = {
                                    id: item.id,
                                    devices: devicesList
                                }

                                

                                this.setState({
                                    ifComponents:this.state.ifComponents.concat(ifComponentData),
                                    dataLoaded:true
                                })

                            

                            })
                            .catch(error => {
                                console.error(`"${data.type}" not yet supported`);
                            });
                    })
                }

                else if (DataType == "component") {
                    GetComponent(condition["id"], data => {
                        import(`../../components/${data.id}`)
                            .then(component => {
                                var mergeJSON = require("merge-json");
                                var devicePropertiesMerged = { "properties": mergeJSON.merge(data.properties, condition.properties) };
                                var deviceDataMerged = mergeJSON.merge(data, devicePropertiesMerged);
                                const deviceData = {
                                    data: deviceDataMerged,
                                    component: component.ModuleList,
                                }
                                devicesList.push(deviceData);
                                const ifComponentData = {
                                    id: item.id,
                                    devices: devicesList
                                }
                                this.setState({
                                    ifComponents:this.state.ifComponents.concat(ifComponentData),
                                    dataLoaded:true
                                })
                            })
                            .catch(error => {
                                console.error(`"${data.id}" not yet supported`);
                            });
                    })
                }

            })

    }

    // return ifComponentData;

}


    renderResult = (result) => {
        result.map((item) => { 
            this.renderItem(item);   
        })
        }
    
        

    getRules = () => {
        fetch("/api/rules")
        .then(response => response.json())
        .then((result) => {
            this.setState({ruleData:result.sort((a, b) => b.id - a.id), dataLoaded:true});
            this.renderResult(result)
        })
       
        .catch((error) => {
            console.error(error)
        })
    }    

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
                this.getRules();
        }   
    }


    togglePublished = (ruleId, publishState) => {
        if (this._isMounted) {
        fetch(`/api/rules/${ruleId}/published`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(publishState ? 0 : 1)
            })
            .then(response => response.json())
            .then((result) => {
                        if(result!=="False"){  
                            const list = this.state.ruleData.filter(item => item.id!= result.id).concat(result).sort((a, b) => b.id - a.id);
                            this.setState({
                                ruleData:list
                            })
                            Notification(`${publishState ? "default" : "success"}`,`${publishState ? "Unpublished" : "Published"}`,`${publishState ? "Rule Unpublished Successfully" : "Rule Published Successfully"}`)
                        }else{
                                Notification("error","Published","There was an error publishing")
                        }
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }

    deleteRule = (ruleId) => {
        if (this._isMounted) {
        fetch(`/api/rules/${ruleId}/delete`, {
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
                        ifComponents:[],
                    })
                    this.setState({ruleData:result.sort((a, b) => b.id - a.id), dataLoaded:true});  
                    this.renderResult(result)
                    Notification("default","Delete","Rule Deleted Successfully")
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
                <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                <Link to={{ pathname: `/rules/0`, data: null }} className="btn btn-info mb-2"><i className="fas fa-plus"></i> Create Rule</Link>
                <div className="card card-shadow mt-3">
                    {this.state.dataLoaded && (
                        this.state.ruleData.map((item, index) => {
                            return (     
                                    <div className="p-all-less list-item" key={index}>
                                        <div className="row">          
                                            <div className="col-md-1 text-center text-lg text-bold v-center">
                                                <div className="content-v-center">
                                                    <span className="icon-1x icon-bg-info text-bold ">if</span>

                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                            {  
                                               this.state.ifComponents.length > 0 ?
                                               this.state.ifComponents.map((conditionDevice,index)=>{
                                                
                                                let renderComponent =  null;   
                                                if(conditionDevice.id==item.id){
                                                        conditionDevice.devices.map((device, index) => {
                                                        const Component = device.component;
                                                        const Data = device.data;
                                                        renderComponent =  <Component key={index} data={Data}  dataType={`if`}/>                                                 
                                                    })
                                                   }
                                                   return renderComponent;
                                               })
                                                : (
                                                    <>Add If Devices Here</>
                                                )
                                            }
                                            </div>
                                            <div className="col-md-3 text-right v-center">
                                                <span className="badge-1x icon-bg-info text-bold">then</span>
                                            </div>
                                            <div className="col-md-4 text-right v-center">
                                            <div className="action-buttons">
                                            <Link to={{ pathname: `/rules/${item.id}`, data: null }} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>

                                            <span className={`btn-action icon-1x icon-bg-default text-bold ${item.published ? "icon-publish text-success" :"icon-unpublish text-muted"}`} onClick={() => this.togglePublished(item.id, item.published)}>
                                            </span>

                                            <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRule(item.id)}>
                                                       
                                            </span> 
                                            </div>    
                                            </div>
                                        </div>
                                    </div>
                                    
                                )
                        })
                    )
                    }
                </div>
            </>)
    }
}





export class RuleEdit extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            ifComponents: [],
            andComponents: [],
            thenComponents: [],
            ruleData: [],
            dataLoaded: false,
            allLoaded:false
        }
        this.id = 0; 
        this.published = 0;
        this.initialValues = {
            "rule_if": [],
            "rule_and": [],
            "rule_then": [],
        }
    }


    refreshComponent = (conditionData,type) => {
        if(this._isMounted){
        let devicesList = [];
        if (conditionData.length > 0) {
            conditionData.map((condition, index) => {
                
                const DataType = condition["type"]
                if (DataType == "device") {

                    GetDevice(condition["id"], data => {
                        import(`../../components/${data.component}/${data.type}`)
                            .then(component => {

                                var mergeJSON = require("merge-json");
                                var devicePropertiesMerged = { "properties": mergeJSON.merge(data.properties, condition.properties) };
                                var deviceDataMerged = mergeJSON.merge(data, devicePropertiesMerged);

                                const deviceData = {
                                    data: deviceDataMerged,
                                    indexMap:condition.indexMap,
                                    component: component.ModuleList,
                                    values:condition
                                }


                                devicesList.push(deviceData);

                                if (type == "if") {
                                    this.setState({
                                        // ...this.state.ifComponents,
                                        ifComponents:devicesList,
                                        dataLoaded: true
                                    })
                                }
                                if (type == "and") {
                                    this.setState({
                                        // ...this.state.andComponents,
                                        andComponents: devicesList.sort((a, b) => a.indexMap - b.indexMap),
                                        dataLoaded: true
                                    })
                                }
                                if (type == "then") {
                                    this.setState({
                                        // ...this.state.thenComponents,
                                        thenComponents: devicesList.sort((a, b) => a.indexMap - b.indexMap),
                                        dataLoaded: true
                                    })
                                }
                            })
                            .catch(error => {
                                console.error(`"${data.type}" not yet supported`);
                            });
                    })

                }
                else if (DataType == "component") {
                    GetComponent(condition["id"], data => {
                        import(`../../components/${data.id}`)
                            .then(component => {
                                var mergeJSON = require("merge-json");
                                var devicePropertiesMerged = { "properties": mergeJSON.merge(data.properties, condition.properties) };
                                var deviceDataMerged = mergeJSON.merge(data, devicePropertiesMerged);

                                const deviceData = {
                                    data: deviceDataMerged,
                                    indexMap:condition.indexMap,
                                    component: component.ModuleList,
                                    values:condition
                                }

                                devicesList.push(deviceData);

                                if (type == "if") {
                                    this.setState({
                                        // ...this.state.ifComponents,
                                        ifComponents:devicesList,
                                        dataLoaded: true,
                                        allLoaded:true
                                    })
                                }
                                if (type == "and") {
                                    this.setState({
                                        // ...this.state.andComponents,
                                        andComponents: devicesList.sort((a, b) => a.indexMap - b.indexMap),
                                        dataLoaded: true
                                    })
                                }
                                if (type == "then") {
                                    this.setState({
                                        // ...this.state.thenComponents,
                                        thenComponents: devicesList.sort((a, b) => a.indexMap - b.indexMap),
                                        dataLoaded: true,
                                        
                                    })
                                }
                            })
                            .catch(error => {
                                console.error(`"${data.id}" not yet supported`);
                            });
                    })
                }
            })
        }else{
            if (type == "if") {
                this.setState({
                    ifComponents:[],
                    dataLoaded: true,
                    allLoaded:true
                })
            }

            if (type == "and") {
                this.setState({
                    andComponents: [],
                    dataLoaded: true
                })
            }

            if (type == "then") {
                this.setState({
                    thenComponents: [],
                    dataLoaded: true,
                    
                })
            }
        }
    }
    }


    removeIndex = (array, value) => {
        let ar = [];
        array.map((item,index) => {
            if (item.indexMap != value) {
                 ar[index] = item    
            }
        })
        return ar;
    }
  

    deleteDevice = (indexMap, dataType) => {
            if (dataType == "if") {
                //
                this.initialValues.rule_if = this.removeIndex(this.initialValues.rule_if,indexMap)
                this.refreshComponent(this.initialValues.rule_if,dataType);
            }
            if (dataType == "and") {
                const rule_and = this.removeIndex(this.state.andComponents,indexMap)
                this.setState({
                    andComponents:rule_and
                })   
                this.initialValues.rule_and = this.removeIndex(this.initialValues.rule_and,indexMap);
                this.refreshComponent(this.initialValues.rule_and,dataType);
            }
            if (dataType == "then") {
                const rule_then = this.removeIndex(this.state.thenComponents,indexMap)
                this.setState({
                    thenComponents:rule_then
                })  
                this.initialValues.rule_then = this.removeIndex(this.initialValues.rule_then,indexMap);
                this.refreshComponent(this.initialValues.rule_then,dataType);
            }
    }

    // shouldComponentUpdate(){
    //     return true;
    // } 

    combineArray = (parentArray,newArray) => {
        let result = [];
        const arrayCountHelper = parentArray.length;
        var mergeJSON = require("merge-json");        
        parentArray.map((arrayItem, index)=>{
            const addIndex = {"indexMap":index}
            var dataMerged = mergeJSON.merge(addIndex, arrayItem);
            result[index]= dataMerged;
        })
        const addIndexNew = {"indexMap":arrayCountHelper}
        var dataMergedNew = mergeJSON.merge(addIndexNew, newArray);
        result[arrayCountHelper] = dataMergedNew;
        return result;
    }


    addDevice = (defaultProperties, dataType) => {
            if (dataType == "if") {
                this.initialValues.rule_if = [];
                this.initialValues.rule_if = this.combineArray(this.initialValues.rule_if,defaultProperties);
                this.refreshComponent(this.initialValues.rule_if,dataType);
            }
            if (dataType == "and") {
                this.initialValues.rule_and = this.combineArray(this.initialValues.rule_and,defaultProperties);
                this.refreshComponent(this.initialValues.rule_and,dataType);
            }
            if (dataType == "then") {
                this.initialValues.rule_then = this.combineArray(this.initialValues.rule_then,defaultProperties);
                this.refreshComponent(this.initialValues.rule_then,dataType);
            }  
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
                fetch(`/api/rules/${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                            this.setState({
                                ruleData: result,
                            })
                            this.id = result.id;
                            this.published = result.published;
                            this.initialValues.rule_if = this.addIndexMap(result.rule_if);
                            this.initialValues.rule_and = this.addIndexMap(result.rule_and);
                            this.initialValues.rule_then = this.addIndexMap(result.rule_then);
                            this.refreshComponent(this.initialValues.rule_if,"if");
                            this.refreshComponent(this.initialValues.rule_and,"and");
                            this.refreshComponent(this.initialValues.rule_then,"then");               
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


    componentWillUnmount() {
        this._isMounted = false;
    }


    saveFormData = (data) => {
        fetch(`/api/rules/${this.id}/save`, {
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
                    Notification("success","Saved","Rule Saved Successfully")
                }else{
                    Notification("error","Error","There was an error saving")
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    cleanFormData = (formValues) => {
        let result = {}
        Object.keys(formValues).map((conditionItem,index) => {
            result[conditionItem] = formValues[conditionItem].filter(Boolean)
                let deviceConditions = result[conditionItem];
                    let devices = []
                    deviceConditions.map((conditionDevice,index)=>{
                        let createDeviceCondition = {}
                        Object.keys(conditionDevice).map((key,index)=>{
                            if(key!="indexMap"){
                                createDeviceCondition[key] = conditionDevice[key]
                            }
                        })
                        devices[index] = createDeviceCondition;
                    })
                    result[conditionItem] = devices;
        })
        result["published"] = this.published;
        result["trigger"] = 1;
        result["id"] = this.id;  
        return result;
    }


    render() {
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded &&
                    (
                        <>
                            <Formik
                                // enableReinitialize
                                initialValues={this.initialValues}
                                // validate={}
                                onSubmit={(values, { setSubmitting }) => {
                                    const getCleanFormData = this.cleanFormData(values);
                                    console.log(values);
                                    this.saveFormData(getCleanFormData);
                                    setSubmitting(false);
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
                                            <button type="submit" disabled={isSubmitting} className="btn btn-info mb-2">
                                               <i className="fas fa-check-circle"></i> Save Rule
                                            </button>

                                            <div className="card card-shadow mt-3">
                                                <div className="card-body">

                                                    <span className="icon-1x icon-bg-info text-bold mb-3">if</span>

                                                    <div className="row">
                                                        {
                                                            this.state.ifComponents.length > 0 ?
                                                                this.state.ifComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    let deviceValues = device.values;
                                                                    return (
                                                                        <div className="col-md-4 mb-3" key={index}>
                                                                            <Component key={index} indexMap={indexMap} values={deviceValues} data={Data} dataType={`if`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice}/>
                                                                        </div>
                                                                    )
                                                                }) : null
                                                        } 
                                                        {
                                                            this.state.allLoaded ? 
                                                                this.state.ifComponents.length == 0 && (
                                                                <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`if`} setFieldValue={setFieldValue} values={values} />
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card card-shadow mt-3">
                                                <div className="card-body">

                                                <span className="badge-1x icon-bg-info text-bold mb-3 ">and</span>    

                                                    <div className="row">
                                                        {
                                                            this.state.andComponents.length > 0 ? 
                                                                this.state.andComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    let deviceValues = device.values;
                                                                    return (
                                                                        <div className="col-md-4 mb-3" key={indexMap}>
                                                                            <Component key={indexMap} indexMap={indexMap} values={deviceValues} data={Data} dataType={`and`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice} />
                                                                        </div>
                                                                    )
                                                                }) :  null
                                                        }

                                                                <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`and`} setFieldValue={setFieldValue} values={values} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card card-shadow mt-3 ">
                                                <div className="card-body">

                                                <span className="badge-1x icon-bg-info text-bold mb-3 ">then</span>
                                                    <div className="row">
                                                        {
                                                            this.state.thenComponents.length > 0 ?
                                                                this.state.thenComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    let deviceValues = device.values;
                                                                    
                                                                  
                                                                    return (
                                                                        <div className="col-md-4 mb-3" key={indexMap}>
                                                                            <Component key={indexMap} indexMap={indexMap} values={deviceValues} data={Data} dataType={`then`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice}/>
                                                                        </div>
                                                                    )
                                                                }) : null
                                                        }
                                                            <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`then`} setFieldValue={setFieldValue} values={values} />

                                                    </div>
                                                </div>
                                            </div>
                                           
                                        </form>
                                    )}
                            </Formik>
                        </>
                    )
                }
            </>)
    }
}


