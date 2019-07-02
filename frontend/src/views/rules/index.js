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
            const ifData = item.if;
            const andData = item.and;
            const thenData = item.then;
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
            }else{
                import(`../../components/${ifDataType}`)
                .then(component => {

                    var ruleData = {"ifData":ifData, "andData":andData, "thenData":thenData}
                    var deviceDataMergedResult = ruleData;

                    const deviceData = {
                        id:null, 
                        data:deviceDataMergedResult, 
                        component:component.ModuleList
                    }

                    devicesList.push(deviceData); 

                    const ifComponentData = {
                        id : item.id,
                        devices :  devicesList
                    }

                    this.setState({
                        ifComponents: this.state.ifComponents.concat(ifComponentData),
                    })
                })
                .catch(error => {
                    console.error(`"${ifDataType}" not yet supported`);
                });
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
                <button className="btn btn-info mb-2"><i className="fas fa-plus-circle"></i> Create New Rule</button>
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
            // ifData: [],
            // andData: [],
            // thenData:[],
            ruleId:null,
            ruleData:null,
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
                    var ruleDataRaw = {"ruleId":this.state.ruleId,"ifData":ruleData.if, "andData":ruleData.and, "thenData":ruleData.then}
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
        }else if(DataType){
            import(`../../components/${DataType}`)
            .then(component => {

                var ruleDataRaw = {"ruleId":this.state.ruleId,"ifData":ruleData.if, "andData":ruleData.and, "thenData":ruleData.then}
                var deviceDataMergedResult = ruleDataRaw;

                const deviceData = {
                    id:null, 
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
                console.error(`"${DataType}" not yet supported`);
            });
        }

    }


    renderResult = (item) => {
        const ifData = item.if;
        const andData = item.and;
        const thenData = item.then;
        this.setState({
            ifData:item.if,
            andData:item.and,
            thenData:item.then,
        })       
        this.addComponent(ifData,item,"if");
        this.addComponent(andData,item,"and");
        this.addComponent(thenData,item,"then");
    }


    componentDidMount() {
        this._isMounted = true;
        fetch(`/api/rules?id=${this.props.match.params.id}`)
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.renderResult(result);
                    this.setState({
                        ruleId:this.props.match.params.id,
                        ruleData:result,
                        dataLoaded: true
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

        // let ifData = []
        // let andData = []
        // let thenData = []

        

        
       let myData = this.state.ruleData;  

        // let ruleData = this.state.item;
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded && 
                
                // console.log(this.state.ruleData.if)
                
                (

                    <>
                        <Formik
                            initialValues={
                                myData
                            }
                            // validate={}
                            onSubmit={(values, { setSubmitting }) => {
                                
                                console.log("-----------");
                                console.log(values);
                                console.log("-----------");
                                // alert(JSON.stringify(values, null, 200));
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
                            {   
                                this.state.ifComponents.map((result,index)=>{
                                    let loadComponent = null;
                                    result.devices.map((device,index) => {
                                        const Component = device.component;
                                        const Data = device.data;
                                        loadComponent = <Component values={values.if} data={Data} handleBlur={handleBlur} handleChange={handleChange} dataType={`if`} setFieldValue={setFieldValue}/>
                                    })
                                    return (<div key={index}>{loadComponent}</div>);
                                })
                            }
                            </div>
                            <AddDeviceModal/> 
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                            {   
                                this.state.andComponents.map((result,index)=>{
                                    let loadComponent = null;
                                    result.devices.map((device,index) => {
                                        const Component = device.component;
                                        const Data = device.data;
                                        loadComponent = <Component data={Data}  dataType={`and[${index}]`}/>
                                    })
                                    return (<div key={index}>{loadComponent}</div>);
                                })
                            }
                            </div>
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                            {   
                                this.state.thenComponents.map((result,index)=>{
                                    let loadComponent = null;
                                    result.devices.map((device,index) => {
                                        const Component = device.component;
                                        const Data = device.data;
                                        loadComponent = <Component data={Data} dataType={`then[${index}]`}/>
                                    })
                                    return (<div key={index}>{loadComponent}</div>);
                                })
                            }
                            </div>
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


