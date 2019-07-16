import React, { Component } from "react";
import { Link, Redirect } from 'react-router-dom';


export class Components extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list : [],
            dataLoaded: false
        }
    }



    componentDidMount() {
        this._isMounted = true;
        if(this._isMounted){
            fetch("/api/components")
            .then(response => response.json())
            .then((result) => {
                if (this._isMounted) {
                    this.setState({
                        list:result,
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
       return(
            <>
            {
                this.state.dataLoaded ? 
                (   
                                
                                this.state.list.map((item,index)=>{

                                    return(
                                        <div className="p-all-less list-item" key={index}>
                                        <div className="row">          
                                                <div className="col-md-5">
                                                    <div className="p-all-less">
                                                        <span className="icon-1x icon-bg-info text-bold icon-left">{item.name.charAt(0)}</span>
                                                        <div className="text-bold">{item.name?item.name:"..."}</div>
                                                        <div className="text-secondary">{item.description?item.description:"..."}</div>
                                                        </div>
                                                </div>
                                           
                                            <div className="col-md-3 text-right v-center">
                                               
                                            </div>
                                            <div className="col-md-4 text-right v-center">
                                            <div className="action-buttons">
                                            <Link to={{ pathname: `/components/${item.id}`}} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>

                                            <span className={`btn-action icon-1x icon-bg-default text-bold ${item.published ? "icon-publish text-success" :"icon-unpublish text-muted"}`} onClick={() => this.togglePublished(item.id, item.published)}>
                                            </span>
                                            {/* <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRule(item.id)}>     
                                            </span>  */}

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
        </>
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
        this.id = 0; 
       
    }

    render() {
        return (
            <>
                   <div className="header mb-4">
                       <div className="float-left">
                           <h1><i className="fal fa-cog"></i> Settings / Components / MQTT</h1>
                           </div>
                        <div className="float-right text-right"></div>
                        <div className="clearfix"></div>
                </div>
            </>
        )
    }
}




