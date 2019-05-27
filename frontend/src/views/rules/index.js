import React, { Component } from "react";
import { Header } from "../common/header";
import { Link } from 'react-router-dom';
import { GetDevice } from "../dashboard/devices";

export class Rules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            components:[],
            list:[],
            dataLoaded: false,
        }
    }


    renderResult = (result) => {
        result.map((item) => {
            const ifData = item.if;
            const ifDataType = ifData["type"]
            // const ifDataType = Object.keys(ifData)[0];        
            if(ifDataType=="device"){
                GetDevice(ifData["id"],data => {
                    import(`../../components/${data.component}/${data.type}`)
                    .then(component => {
                        this.addComponent(component,item.id,data);
                    })
                    .catch(error => {
                        console.error(`"${data.type}" not yet supported`);
                    });
                })
            }else{
                import(`../../components/${ifDataType}`)
                .then(component => {
                    this.addComponent(component,item.id,null);
                })
                .catch(error => {
                    console.error(`"${ifDataType}" not yet supported`);
                });
            }
            
        })
    }
    

    addComponent = (component,id,data) => {
        const componentItem = {
            id: id,
            data : data,
            component:component.ModuleRule,
        };
        this.setState({
            components: this.state.components.concat(componentItem),
        })
    }

    
    componentDidMount() {
        // let result = [
        //     {
        //         "trigger": 0,
        //         "and": "{}",
        //         "modified": "2019-05-13 00:41:25",
        //         "id": 1,
        //         "published": 0,
        //         "if": "{\"device\":8,\"condition\":\"=\",\"properties\":{\"relay\":{\"0\":1}}}",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":1}}}"
        //     },
        //     {
        //         "trigger": 1,
        //         "and": "{}",
        //         "modified": "2019-05-13 00:41:25",
        //         "id": 2,
        //         "published": 0,
        //         "if": "{\"device\":8,\"condition\":\"=\",\"properties\":{\"relay\":{\"0\":0}}}\t",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":0}}}"
        //     },
        //     {
        //         "trigger": 1,
        //         "and": "{}",
        //         "modified": "2019-04-04 00:31:05",
        //         "id": 3,
        //         "published": 0,
        //         "if": "{\"device\":5,\"condition\":\"<\",\"properties\":{\"light\":{\"value\":20}}}\t",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":1}}}\t"
        //     },
        //     {
        //         "trigger": 1,
        //         "and": "{}",
        //         "modified": "2019-04-04 17:04:52",
        //         "id": 4,
        //         "published": 0,
        //         "if": "{\"device\":5,\"condition\":\">\",\"properties\":{\"light\":{\"value\":30}}}\t",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":0}}}\t"
        //     },
        //     {
        //         "trigger": 0,
        //         "and": "{}",
        //         "modified": "2019-05-15 19:00:12",
        //         "id": 5,
        //         "published": 1,
        //         "if": "{\"device\":6,\"condition\":\"=\",\"properties\":{\"astral\":{\"above_horizon\":\"false\"}}}\t",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":1}}}\t"
        //     },
        //     {
        //         "trigger": 1,
        //         "and": "{}",
        //         "modified": "2019-05-15 21:02:01",
        //         "id": 6,
        //         "published": 1,
        //         "if": "{\r\n\t\"datetime\": \"time\",\r\n\t\"condition\": \"=\",\r\n\t\"properties\": {\r\n\t\t\"time\": [21,2],\r\n\t\t\"day\": [\r\n\t\t\t0,1,2,3,4,5,6\r\n\t\t]\r\n\t}\r\n}",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":1}}}"
        //     },
        //     {
        //         "trigger": 1,
        //         "and": "{}",
        //         "modified": "2019-05-16 00:34:01",
        //         "id": 7,
        //         "published": 1,
        //         "if": "{ \"datetime\": \"time\", \"condition\": \"=\", \"properties\": { \"time\": [0,34], \"day\": [ 0,1,2,3,4,6 ] } }\t",
        //         "then": "{\"device\":8,\"actions\":{\"relay\":{\"0\":1}}}\t"
        //     }
        // ]

        // // this.setState({
        // //     items: result.sort((a, b) => a.id - b.id),
        // //     dataLoaded: true
        // // });
        // this.renderResult(result);

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
                                            this.state.components.map((component)=>{
                                                if(component.id==item.id){
                                                    const Component = component.component;
                                                    const Data = component.data;
                                                    return <Component key={index} data={Data} component={item} />
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
            item: [],
            dataLoaded: false,
        }
    }

    componentDidMount() {

        // let result = 
        //     {
        //         "trigger": 0,
        //         "and": "{}",
        //         "modified": "2019-05-13 00:41:25",
        //         "id": 1,
        //         "published": 0,
        //         "if": "{\"device\":8,\"condition\":\"=\",\"properties\":{\"relay\":{\"0\":1}}}",
        //         "then": "{\"device\":9,\"actions\":{\"relay\":{\"0\":1}}}"
        //     }
        

        // this.setState({
        //     item: result,
        //     dataLoaded: true
        // });

        this._isMounted = true;
        fetch(`/api/rules?id=${this.props.match.params.id}`)
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    console.log(result)
                    this.setState({
                        item:result,
                        dataLoaded: true
                    });
                }
                
            })
            .catch((error) => {
                console.error(error)
            })
            // console.log(this.props.match.params.id);
           
    }

    componentWillUnmount() {  
        this._isMounted = false;
    }


    render() {
        let ruleData = this.state.item;
        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded && 
                (

                    <>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {JSON.stringify(ruleData.if)}
                            </div>
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {JSON.stringify(ruleData.and)}
                            </div>
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {JSON.stringify(ruleData.then)}
                            </div>
                        </div>
                    </>

                )
                
                }
            </>)    
    }
}


