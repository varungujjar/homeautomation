import React, { Component } from "react";
import { Header } from "../common/header";
import { Link } from 'react-router-dom';


export class Rules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            dataLoaded: false,
        }
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
        //         "if": "{ \"datetime\": \"time\", \"condition\": \"=\", \"properties\": { \"time\": [0,34], \"day\": [ 0,1,2,3,4,5,6 ] } }\t",
        //         "then": "{\"device\":8,\"actions\":{\"relay\":{\"0\":1}}}\t"
        //     }
        // ]

        // this.setState({
        //     items: result.sort((a, b) => a.order - b.order),
        //     dataLoaded: true
        // });

        this._isMounted = true;
        fetch("/api/rules")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        items: result.sort((a, b) => a.order - b.order),
                        dataLoaded: true
                    });
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

                { this.state.dataLoaded && (
                    this.state.items.map((item,index)=>(

                        <div key={index} className="card card-shadow mt-2">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-1">{item.published}</div>
                                <div className="col-md-2">If</div>
                                <div className="col-md-4">
                                    <div className="card card-outline">
                                    {item.if}
                                    </div>
                                </div>
                                <div className="col-md-2"></div>
                                <div className="col-md-3 text-right">
                                <Link to={{pathname:`/rules/${item.id}`,data:item}} className="btn btn-default">...</Link>
                                
                                 {item.id}</div>
                            </div>
                        

                        </div>
                
               </div>   




                    ))
                )
                }



                
               

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
        this._isMounted = true;
        fetch(`/api/rules?id=${this.props.match.params.id}`)
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        item:result,
                        dataLoaded: true
                    });
                }
                
            })
            .catch((error) => {
                console.error(error)
            })
            console.log(this.props.match.params.id);
           
    }

    componentWillUnmount() {  
        this._isMounted = false;
    }


    render() {
        let ruleData = this.state.item;
        console.log(this.state.item)

        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>
                {this.state.dataLoaded && 
                (

                    <>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {ruleData.if}
                            </div>
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {ruleData.and}
                            </div>
                        </div>
                        <div className="card card-shadow mt-3">
                            <div className="card-body">
                                {ruleData.then}
                            </div>
                        </div>
                    </>

                )
                
                
                }
            </>)    
    }
}


