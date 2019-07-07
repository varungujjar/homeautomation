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
            ifComponents:[],
            list:[],
            dataLoaded: false,
        }
    }


    renderResult = (result) => {
        result.map((item) => {
            const ifData = item.rule_if;
            const andData = item.rule_and;
            const thenData = item.rule_then;
            const ifDataType = ifData["type"]
            let devicesList = [];
            // const ifDataType = Object.keys(ifData)[0];

            if(ifDataType=="device"){
                GetDevice(ifData["id"],data => {
                    import(`../../components/${data.component}/${data.type}`)
                    .then(component => {
                     
                        var mergeJSON = require("merge-json") ;
                        var devicePropertiesMerged = {"properties":mergeJSON.merge(data.properties,ifData.properties)};  
                        var deviceDataMerged = mergeJSON.merge(data,devicePropertiesMerged);
                        var ruleData = {"ifData":ifData, "andData":andData, "thenData":thenData}
                        var deviceDataMergedResult = mergeJSON.merge(deviceDataMerged,ruleData);
                        
                        const deviceData = {
                            id:deviceDataMerged.id, 
                            data:deviceDataMergedResult, 
                            component:component.ModuleList
                        }

                        devicesList.push(deviceData); 

                        const ifComponentData = {
                            id : item.id,
                            devices : devicesList
                        }

                        this.setState({
                            ifComponents: this.state.ifComponents.concat(ifComponentData),
                        })

                    })
                    .catch(error => {
                        console.error(`"${data.type}" not yet supported`);
                    });
                })
            }
            
        })
    }
    

    // addComponent = (component,id,data) => {
    //     const componentItem = {
    //         id: id,
    //         data : data,
    //         component:component.ModuleRuleListing,
    //     };
    //     this.setState({
    //         components: this.state.components.concat(componentItem),
    //     })
    // }

    
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
                    // console.log(result);
                    this.setState({
                        dataLoaded: true
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
           
    }


    togglePublished = (ruleId,publishState) => {
        fetch(`/api/rules?id=${ruleId}&published=${publishState ? 0 : 1}`)
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    let list = [];
                    list = this.state.list.filter(item => item.id != result.id).concat(result).sort((a, b) => a.id - b.id);
                    this.setState({
                        list:list,
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
                <Link to={{ pathname: `/rules/0`, data:null }} className="btn btn-info mb-2"><i className="fas fa-plus-circle"></i> Create New Rule</Link>

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
                                            this.state.ifComponents.map((result,index)=>{
                                                let loadComponent = null;
                                                if(result.id==item.id){
                                                     result.devices.map((device,index) =>{
                                                        const Component = device.component;
                                                        const Data = device.data;
                                                        // console.log(Data);
                                                        loadComponent = <Component data={Data} />
                                                    })
                                                   return (<div key={index}>{loadComponent}</div>);
                                                }
                                            })

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
        this.state = {
            ifComponents:[],
            andComponents:[],
            thenComponents:[],
            ruleId:null,
            ruleData:{},
            dataLoaded: false,
        }
    }


    addComponent = (conditionData,ruleData,type) => {
        const DataType = conditionData["type"]
        let devicesList = [];


        if(DataType=="device"){
            GetDevice(conditionData["id"],data => {
                import(`../../components/${data.component}/${data.type}`)
                .then(component => {
                 
                    var mergeJSON = require("merge-json") ;
                    var devicePropertiesMerged = {"properties":mergeJSON.merge(data.properties,conditionData.properties)};  
                    var deviceDataMerged = mergeJSON.merge(data,devicePropertiesMerged);
                    var ruleDataRaw = {"ruleId":this.state.ruleId,"ifData":ruleData.rule_if, "andData":ruleData.rule_and, "thenData":ruleData.rule_then}
                    var deviceDataMergedResult = mergeJSON.merge(deviceDataMerged,ruleDataRaw);
                    
                    const deviceData = {
                        id:deviceDataMerged.id, 
                        data:deviceDataMergedResult, 
                        component:component.ModuleList
                    }

                    devicesList.push(deviceData); 

                    if(type=="if"){
                        
                        const ifComponentData = {
                            id : ruleData.id,
                            devices : devicesList
                        }
    
                        this.setState({
                            ifComponents: this.state.ifComponents.concat(ifComponentData),
                        })
                    }
                    if(type=="and"){
                        const andComponentData = {
                            id : ruleData.id,
                            devices : devicesList
                        }
    
                        this.setState({
                            andComponents: this.state.andComponents.concat(andComponentData),
                        })
                    }
                    if(type=="then"){
                        
                        const thenComponentData = {
                            id : ruleData.id,
                            devices : devicesList
                        }
    
                        this.setState({
                            thenComponents: this.state.thenComponents.concat(thenComponentData),
                        })
                    }
                    

                })
                .catch(error => {
                    console.error(`"${data.type}" not yet supported`);
                });
            })
        }

    }


    renderDevice = (defaultProperties,setFieldValue,values,dataType) => {
        
        if(dataType=="if"){
              values.rule_if = defaultProperties;
              setFieldValue(values.rule_if)
              this.setState({
                ifComponents:[]
              })
        }

        if(dataType=="and"){
            values.rule_and = defaultProperties;
            setFieldValue(values.rule_and)
           
        }

        if(dataType=="then"){
            values.rule_then = defaultProperties;
            setFieldValue(values.rule_then)
           
        }
        
        this.addComponent(defaultProperties,this.state.ruleData,dataType);  
    }


    componentDidMount() {
        this._isMounted = true;
        if(this.props.match.params.id!=0){
            fetch(`/api/rules?id=${this.props.match.params.id}`)
                .then(response => response.json())
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({
                            ruleId:this.props.match.params.id,
                            ruleData:result,
                            dataLoaded: true
                        })
                        this.addComponent(result.rule_if,result,"if");
                        this.addComponent(result.rule_and,result,"and");
                        this.addComponent(result.rule_then,result,"then");        
                    }     
                })
                .catch((error) => {
                    console.error(error)
                })
        }else{
            this.setState({
                dataLoaded: true
            })
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
       let myData = this.state.ruleData; 

       const initialValues = {
        "rule_if":{},
        "rule_and":{},
        "rule_then":{},
        "published":0
        }
       
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded &&                 
                (
                    <>
                        <Formik
                            initialValues={
                                Object.keys(myData).length == 0 ? initialValues : myData
                            }
                            // validate={}
                            onSubmit={(values, { setSubmitting }) => {
                                // this.saveFormData(values);
                                console.log(values);
                                setSubmitting(false);
                            }}

                            handleChange = {(event) => {
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
                                    this.state.ifComponents.length != 0 ? 
                                        this.state.ifComponents.map((result,index)=>{          
                                            let loadComponent = null;
                                            result.devices.map((device,index) => {
                                                const Component = device.component;
                                                const Data = device.data;
                                                loadComponent = <Component values={values.rule_if} data={Data} handleBlur={handleBlur} handleChange={handleChange} dataType={`if`} setFieldValue={setFieldValue}/>
                                            })
                                            return (<div className="col-md-4" key={index}>{loadComponent}</div>);
                                        })
                                         : (
                                            <>Add If Devices Here</>
                                           )
                                    
                                }
                                </div>
                            </div>
                            <AddDeviceModal renderAddedDevice={this.renderDevice} dataType={`if`} setFieldValue={setFieldValue} values={values}/> 
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                            <div className="row">
                            {   
                                this.state.andComponents.length != 0 ? 
                                this.state.andComponents.map((result,index)=>{
                                    let loadComponent = null;
                                    result.devices.map((device,index) => {
                                        const Component = device.component;
                                        const Data = device.data;
                                        loadComponent = <Component data={Data}  dataType={`and[${index}]`}/>
                                    })
                                    return (<div className="col-md-4" key={index}>{loadComponent}</div>);
                                }): (
                                    <>Add And Devices Here</>
                                   )
                            }
                            </div>
                            </div>
                            <AddDeviceModal renderAddedDevice={this.renderDevice} dataType={`and`} setFieldValue={setFieldValue} values={values}/> 
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                            <div className="row">
                            {   
                               this.state.thenComponents.length != 0 ? 
                               this.state.thenComponents.map((result,index)=>{
                                    let loadComponent = null;
                                    result.devices.map((device,index) => {
                                        const Component = device.component;
                                        const Data = device.data;
                                        loadComponent = <Component values={values.rule_then} data={Data} handleBlur={handleBlur} handleChange={handleChange} dataType={`then`} setFieldValue={setFieldValue}/>
                                    })
                                    return (<div className="col-md-4" key={index}>{loadComponent}</div>);
                                }): (
                                    <>Add Then Devices Here</>
                                   )
                            }
                            </div>
                            </div>
                            <AddDeviceModal renderAddedDevice={this.renderDevice} dataType={`then`} setFieldValue={setFieldValue} values={values}/> 
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


