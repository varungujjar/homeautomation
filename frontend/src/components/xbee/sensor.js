import React from "react";


export const ModuleList = (props) => {  
   const data = props.data; 
   let condition = "None";

   if(data.ifData){       
        if(data.ifData.condition == ">"){
                condition = "Greater than";
        }
        if(data.ifData.condition == "<"){
                condition = "Less than";
        }
    }

    return (
        <div className={`card card-outline-default h-100 ${data.online ? "" : "offline"}`}>
            <div className="offline-icon text-danger"></div>
            <div className="p-all-less">          
                <span className="icon-1x icon-sensor icon-bg-info icon-left"></span>
                <div className="text-bold">{data.name ? data.name : "..."}</div>
                <div className="text-secondary">
                    {
                        data.ifData && 
                        Object.keys(data.ifData.properties).map((item, index) => (
                            <div key={index}>
                                <span className="title-case">{item}&nbsp;</span>
                                <span className="italics">{condition}&nbsp;</span>
                                <span className="text-bold">{data.properties[item].value}</span>
                            </div>
                        ))
                        
                    }{data.room_name ? data.room_name : "..."}
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