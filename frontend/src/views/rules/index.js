import React, { Component } from "react";
import { Header } from "../common/header";
import { Link } from 'react-router-dom';
import { GetDevice } from "../dashboard/devices";
import { AddDeviceModal } from "./adddevicemodal";
import { Formik } from 'formik';

export class Rules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ifComponents: [],
            list: [],
            dataLoaded: false,
        }
    }


    renderResult = (result) => {
        result.map((item) => {
            const ifData = item.rule_if;
            const andData = item.rule_and;
            const thenData = item.rule_then;
            let devicesList = [];
            const conditionData = ifData;    
            

            if (conditionData.length > 0) {
                conditionData.map((condition, index) => {
                    const DataType = condition["type"]    
                    if (DataType == "device") {
                        GetDevice(ifData["id"], data => {
                            import(`../../components/${data.component}/${data.type}`)
                                .then(component => {
                                    var mergeJSON = require("merge-json");
                                    var devicePropertiesMerged = { "properties": mergeJSON.merge(data.properties, ifData.properties) };
                                    var deviceDataMerged = mergeJSON.merge(data, devicePropertiesMerged);
                                    var ruleData = { "ifData": ifData, "andData": andData, "thenData": thenData }
                                    var deviceDataMergedResult = mergeJSON.merge(deviceDataMerged, ruleData);

                                    const deviceData = {
                                        id: deviceDataMerged.id,
                                        data: deviceDataMergedResult,
                                        component: component.ModuleList
                                    }

                                    devicesList.push(deviceData);

                                    const ifComponentData = {
                                        id: item.id,
                                        devices: devicesList
                                    }

                                    this.setState({
                                        ifComponents:ifComponentData,
                                    })

                                })
                                .catch(error => {
                                    console.error(`"${data.type}" not yet supported`);
                                });
                        })
                    }
            })
        }

        })
    }

    componentDidMount() {
        this._isMounted = true;
        fetch("/api/rules")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        list: result.sort((a, b) => a.id - b.id),
                    });
                    this.renderResult(result);
                    this.setState({
                        dataLoaded: true
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }


    togglePublished = (ruleId, publishState) => {
        fetch(`/api/rules?id=${ruleId}&published=${publishState ? 0 : 1}`)
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    let list = [];
                    list = this.state.list.filter(item => item.id != result.id).concat(result).sort((a, b) => a.id - b.id);
                    this.setState({
                        list: list,
                        dataLoaded: true,
                    })
                }

            })
            .catch((error) => {
                console.error(error)
            })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }



    render() {
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                <Link to={{ pathname: `/rules/0`, data: null }} className="btn btn-info mb-2"><i className="fas fa-plus-circle"></i> Create New Rule</Link>

                <div className="card card-shadow mt-3">
                    {this.state.dataLoaded && (
                        this.state.list.map((item, index) => {
                            return (
                                <div key={index} className="list-item">
                                    <div className="p-all-less">
                                        <div className="row">
                                            <div className="col-md-1 text-center text-lg text-bold v-center">
                                                <div className="content-v-center">
                                                    <span className="icon-1x icon-bg-info text-bold ">if</span>

                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                            {
                                                this.state.ifComponents.devices ?
                                                    this.state.ifComponents.devices.map((device, index) => {
                                                        const Component = device.component;
                                                        const Data = device.data;
                                                        const indexMap = device.index;
                                                        return (
                                                            <div className="col-md-4" key={index}>
                                                                <Component key={index} data={Data}/>
                                                            </div>
                                                        )
                                                    }) : (
                                                        <>No If Devices Here</>
                                                    )
                                            }    
                                            </div>
                                            <div className="col-md-3 text-right v-center">
                                                <span className="badge-1x icon-bg-info text-bold">then</span>
                                            </div>
                                            <div className="col-md-2 text-right v-center">
                                                <Link to={{ pathname: `/rules/${item.id}`, data: item }} className="btn "><img src="assets/light/images/dots.svg" /></Link>
                                            </div>
                                            <div className="col-md-1 text-right v-center text-xl">
                                                {
                                                    item.published ?
                                                        (
                                                            <><i className=" text-lg text-success fas fa-check-circle" onClick={() => this.togglePublished(item.id, item.published)}></i></>
                                                        ) :
                                                        (
                                                            <><i className="text-lg text-lg text-muted fas fa-times-circle" onClick={() => this.togglePublished(item.id, item.published)}></i></>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>)
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
        }
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
                                    id: deviceDataMerged.id,
                                    data: deviceDataMerged,
                                    indexMap:condition.indexMap,
                                    component: component.ModuleList,
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
            })
        }else{
            if (type == "if") {
                this.setState({
                    ifComponents:[],
                    dataLoaded: true
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
                    dataLoaded: true
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
  

    deleteDevice = (indexMap, setFieldValue, values, dataType) => {
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


    addDevice = (defaultProperties, setFieldValue, values, dataType) => {
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
                fetch(`/api/rules?id=${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                            this.setState({
                                ruleData: result,
                            })
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
                    dataLoaded: true
                })
            }
        }
    }


    componentWillUnmount() {
        this._isMounted = false;
    }


    saveFormData = (data) => {
        fetch(`/api/rules/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.error(error)
            })
    }

    
    cleanFormData = (formValues) => {
        let result = {}
        Object.keys(formValues).map((conditionItem,index) => {
            result[conditionItem] = formValues[conditionItem].filter(Boolean)
        })
        result["published"] = this.published; 
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
                                    // this.saveFormData(values);
                                    console.log(getCleanFormData);
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
                                                <div className="card-body">
                                                    <div className="row">
                                                        {
                                                            this.state.ifComponents.length > 0 ?
                                                                this.state.ifComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    return (
                                                                        <div className="col-md-4" key={index}>
                                                                            <Component key={index} indexMap={indexMap} values={values} data={Data} handleChange={handleChange} dataType={`if`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice}/>
                                                                        </div>
                                                                    )
                                                                }) : (
                                                                    <>Add If Devices Here</>
                                                                )
                                                        }

                                                    </div>
                                                </div>
                                                <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`if`} setFieldValue={setFieldValue} values={values} />
                                            </div>
                                            <div className="card card-shadow mt-3">
                                                <div className="card-body">
                                                    <div className="row">
                                                        {
                                                            this.state.andComponents.length > 0 ? 
                                                                this.state.andComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    return (
                                                                        <div className="col-md-4" key={indexMap}>
                                                                            <Component key={indexMap} indexMap={indexMap} values={values} data={Data} handleChange={handleChange} dataType={`and`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice} />
                                                                        </div>
                                                                    )
                                                                }) : (
                                                                    <>Add And Devices Here</>
                                                                )
                                                        }
                                                    </div>
                                                </div>
                                                <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`and`} setFieldValue={setFieldValue} values={values} />
                                            </div>
                                            <div className="card card-shadow mt-3">
                                                <div className="card-body">
                                                    <div className="row">
                                                        {
                                                            this.state.thenComponents.length > 0 ?
                                                                this.state.thenComponents.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    return (
                                                                        <div className="col-md-4" key={indexMap}>
                                                                            <Component key={indexMap} indexMap={indexMap} values={values} data={Data} handleChange={handleChange} dataType={`then`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice}/>
                                                                        </div>
                                                                    )
                                                                }) : (
                                                                    <>Add Then Devices Here</>
                                                                )
                                                        }
                                                    </div>
                                                </div>
                                                <AddDeviceModal renderAddedDevice={this.addDevice} dataType={`then`} setFieldValue={setFieldValue} values={values} />
                                            </div>
                                            <button type="submit" disabled={isSubmitting}>
                                                Submit
                                            </button>
                                        </form>
                                    )}
                            </Formik>
                        </>
                    )
                }
            </>)
    }
}


