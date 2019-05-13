import React from "react";
import { NavLink } from 'react-router-dom';

const Nav = () => {
    return (
        <ul>
            <li><NavLink exact to="/" activeClassName="active"><i className="fal fa-home"></i></NavLink></li>
            <li><NavLink to="/rules" activeClassName="active"><i className="fal fa-list-alt"></i></NavLink></li>
            <li><NavLink to="timeline" activeClassName="active"><i className="fal fa-stream"></i></NavLink></li>
            {/* <li><NavLink to="/settings" activeClassName="active"><i className="fal fa-clone"></i></NavLink></li> */}
            <li><NavLink to="/settings" activeClassName="active"><i className="fal fa-cog"></i></NavLink></li>
        </ul>
    )
}

export const MobileNav = () => {
    return (
        <div className="nav-mobile">
            <Nav></Nav>
        </div>
    )
}

export const SideNav = () => {
    return (
        <div className="sidebar">
            <Nav></Nav>
        </div>
    )
}
