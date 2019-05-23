import React from "react";


export const ModuleRule = (props) => {
    const horizon = props.component.if.properties.astral.above_horizon;
    return (
        <div className="card card-outline-default">
            <div className="p-all-less">
            <span className={`icon-1x icon-left ${horizon == "true" ? "icon-warning icon-sunrise " : "icon-dark icon-moon"}`}></span>
                <div className="text-bold">{horizon == "true" ? ("Sun Above Horizon") : ("Sun Below Horizon")}</div>
                <div className="text-secondary">
                {horizon == "true" ? ("On Sunrise") : ("On Sunset")}
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
                   Horizon
                </div>
            </div>
        </div>
    )
}