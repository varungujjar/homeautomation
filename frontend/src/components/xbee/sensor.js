import React from "react";


export const ModuleRule = (props) => {
   let condition = "";
   if(props.component.if.condition == ">"){
        condition = "Greater than";
   }
   if(props.component.if.condition == "<"){
        condition = "Less than";
    }
    let properties = props.component.if.properties;
    return (
        <div className="card card-outline-default  h-100">
            <div className="p-all-less">
                <span className="icon-1x icon-sensor icon-info icon-left"></span>
                <div className="text-bold">{props.data.name ? props.data.name : "..."}</div>
                <div className="text-secondary">
                    {
                        Object.keys(properties).map((item, index) => (
                            <div key={index}>
                                <span className="title-case">{item}&nbsp;</span>
                           <span className="italics">{condition}&nbsp;</span>
                                <span className="text-bold">{properties[item].value}</span>
                            </div>
                        ))
                    }
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
    )

}



export const Module = (props) => {
    const device = props.data;
    return (
        <div className="slider-slide">
            <div className={`card card-shadow item card-hover ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                    Xbee Sensor
                </div>
            </div>
        </div>
    )
}