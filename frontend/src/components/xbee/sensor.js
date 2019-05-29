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
    const online =  props.data.online;
    return (
        <div className={`card card-outline-default h-100 ${online ? "" : "offline"}`}>
            <div className="offline-icon text-danger"></div>
            <div className="p-all-less">
                
                <span className="icon-1x icon-sensor icon-bg-info icon-left"></span>
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
            <div className={`card card-module-height card-shadow item ${device.online ? "" : "offline"}`}>
                <div className="offline-icon text-danger"></div>
                <div className="card-body">
                <span className="show-device-props"><img src="assets/light/images/dots.svg" /></span>
                        <span className="icon-1x icon-bg-info icon-sensor"></span>
                        <div className="text-status ">{Number(device.properties.temperature.value).toFixed(1)} ° {device.properties.temperature.unit}</div>
                        <div className="text-bold mt-2">{device.name ? device.name : "..."}</div>
                        <div className="text-secondary text-md">{device.room_name ? device.room_name : "..."}</div>
                        <div className="clearfix"></div>
                
                </div>
            </div>
        </div>
    )
}