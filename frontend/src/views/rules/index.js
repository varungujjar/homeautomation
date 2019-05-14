import React, { Component } from "react";
import { Header } from "../common/header";


export class Automation extends Component {
    constructor(props) {
        super(props);
    }
   
    render() {

        return (
            <>
                <Header name={this.props.name} icon={this.props.icon}></Header>

                <button className="btn btn-info mb-2"><i className="fas fa-plus-circle"></i> Create New Rule</button>   

                <div className="card card-shadow mt-2">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">If</div>
                                <div className="col-md-4">
                                    <div className="card card-outline">
                                    Switch
                                    </div>
                                </div>
                                <div className="col-md-2"></div>
                                <div className="col-md-3 text-right">...</div>
                            </div>
                        

                        </div>
                
               </div>  

               <div className="card card-shadow mt-2">
                        <div className="card-body">
                        dfdfd

                        </div>
                
               </div>     

            </>)    
    }
}

