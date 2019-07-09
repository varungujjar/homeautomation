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
        this.initialValues = {
            "rule_if": [],
            "rule_and": [],
            "rule_then": [],
            "published": 0
        }
    }


    // renderComponents = (type) => {


    // }

    uuidv4Key = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
        })
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
                                    indexMap: index,
                                    data: deviceDataMerged,
                                    component: component.ModuleList,
                                    // uniqueKey:Date.now() + Math.random(),
                                }

                                devicesList.push(deviceData);

                                if (type == "if") {
                                    const ifComponentData = {
                                        devices: devicesList
                                    }
                                    this.setState({
                                        // ...this.state.ifComponents.devices,
                                        ifComponents: ifComponentData,
                                        dataLoaded: true
                                    })
                                }

                                if (type == "and") {
                                    const andComponentData = {
                                        devices: devicesList
                                    }
                                    this.setState({
                                        // ...this.state.andComponents.devices,
                                        andComponents: andComponentData,
                                        dataLoaded: true
                                    })
                                }

                                if (type == "then") {
                                    const thenComponentData = {
                                        devices: devicesList
                                    }
                                    this.setState({
                                        // ...this.state.thenComponents.devices,
                                        thenComponents: thenComponentData,
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


    deleteDevice = (indexMap, setFieldValue, values, dataType) => {
            if (dataType == "if") {
                const rule_if = this.initialValues.rule_if.splice(indexMap,1);
                this.setState({
                    ruleIf:rule_if
                })
                this.refreshComponent(this.initialValues.rule_if,dataType);
            }
            if (dataType == "and") {
                const rule_and = this.initialValues.rule_and.splice(indexMap,1);
                this.setState({
                    ruleAnd:rule_and
                })
                this.refreshComponent(this.initialValues.rule_and,dataType);
            }
            if (dataType == "then") {
                const rule_then = this.initialValues.rule_then.splice(indexMap,1);
                this.setState({
                    ruleAnd:rule_then
                })
                this.refreshComponent(this.initialValues.rule_then,dataType);
            }

    }

    shouldComponentUpdate(){
        return true;
    } 

    addDevice = (defaultProperties, setFieldValue, values, dataType) => {
            if (dataType == "if") {
                this.initialValues.rule_if = [defaultProperties];
                this.setState({
                    ruleIf:this.initialValues.rule_if
                })
                this.refreshComponent(this.initialValues.rule_if,dataType);
            }
            if (dataType == "and") {
                this.initialValues.rule_and = this.initialValues.rule_and.concat(defaultProperties);
                this.setState({
                    ruleAnd:this.initialValues.rule_and
                })
                this.refreshComponent(this.initialValues.rule_and,dataType);
            }
            if (dataType == "then") {
                this.initialValues.rule_then = this.initialValues.rule_then.concat(defaultProperties);
                this.setState({
                    ruleAnd:this.initialValues.rule_then
                })
                this.refreshComponent(this.initialValues.rule_then,dataType);
            }
            
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
                            this.initialValues.rule_if = result.rule_if
                            this.initialValues.rule_and = result.rule_and
                            this.initialValues.rule_then = result.rule_then
                            this.refreshComponent(result.rule_if,"if");
                            this.refreshComponent(result.rule_and,"and");
                            this.refreshComponent(result.rule_then,"then");               
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




    render() {
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded &&
                    (
                        <>
                            <Formik
                                enableReinitialize
                                initialValues={this.initialValues}
                                // validate={}
                                onSubmit={(values, { setSubmitting }) => {
                                    // this.saveFormData(values);
                                    console.log(values);
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
                                                        {console.log("rela")}
                                                        {
                                                            this.state.ifComponents.devices ?
                                                                this.state.ifComponents.devices.map((device, index) => {
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
                                                          
                                                            this.state.andComponents.devices ?
                                                                this.state.andComponents.devices.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    console.log(Data)
                                                                    return (
                                                                        <div className="col-md-4" key={index}>
                                                                            <Component key={index} indexMap={indexMap} values={values} data={Data} handleChange={handleChange} dataType={`and`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice} />
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
                                                            this.state.thenComponents.devices ?
                                                                this.state.thenComponents.devices.map((device, index) => {
                                                                    const Component = device.component;
                                                                    const Data = device.data;
                                                                    const indexMap = device.indexMap;
                                                                    return (
                                                                        <div className="col-md-4" key={index}>
                                                                            <Component key={index} indexMap={indexMap} values={values} data={Data} handleChange={handleChange} dataType={`then`} setFieldValue={setFieldValue} deleteDefaultProperties={this.deleteDevice}/>
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


