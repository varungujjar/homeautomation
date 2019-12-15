import React, { Component } from "react";
import { Formik } from 'formik';
import { Header } from "../common/header";
import { Intents } from "./intents";
import { Entities } from "./entities";
import PropTypes from 'prop-types'
import SelectTimezone, { getTimezoneProps } from 'react-select-timezone'



export const TabHeads = (props) => {
    const tabs = {"intents":"fa-box-open","entities":"fa-person-booth"};
    return(
             <ul className="nav nav-tabs" id="myTab" role="tablist">
                        {
                            Object.keys(tabs).map((key,index)=>{
                                return(
                                    <li className="nav-item" key={index}>
                                        <a className={`nav-link ${props.disabled ? "disabled" : null} ${key==props.active ? "active" : null} `} id={`${key}-tab`} data-toggle="tab" href={`#${key}`} role="tab" aria-controls={`${key}`} aria-selected="true"><i className={`fal ${Object.values(tabs)[index]}`}></i> {key.charAt(0).toUpperCase() + key.slice(1)}</a>
                                    </li>
                                )
                            })
                        }
                </ul>
    )
}


export const Agent = (props) => {
        const category = props.match.params.category ? props.match.params.category : "intents"
        return (
            <>   
                <Header name={props.name} icon={props.icon}></Header>
                <div className="wrapper">
                <TabHeads active={category} />
                    <div className="tab-content" id="myTabContent">
                        <Intents active={category == "intents" ? 1 : 0}/>
                        <Entities active={category == "entities" ? 1 : 0}/>
                    </div>
                </div>
            </>
           )
}

