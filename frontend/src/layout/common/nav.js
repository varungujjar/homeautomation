import React from "react";
import { NavLink } from 'react-router-dom';

export const Nav = () => {
    return (
        <div className="sidebar">
            <ul>
                <li><NavLink exact to="/" activeClassName="active"><i className="fal fa-home"></i></NavLink></li>
                <li><NavLink to="/rules" activeClassName="active"><i className="fal fa-list-alt"></i></NavLink></li>
                {/* <li><NavLink to="/settings" activeClassName="active"><i className="fal fa-clone"></i></NavLink></li> */}
                <li><NavLink to="/settings" activeClassName="active"><i className="fal fa-cog"></i></NavLink></li>
            </ul>
        </div>
    )
}
