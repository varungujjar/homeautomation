import React from "react";
import { Nav } from "./common/nav";
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import { Dashboard } from "./dashboard";
import { Automation } from "./rules";
import { Settings } from "./settings";


function NoMatch({ location }) {
  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
}


export const Layout = () => {
  return (
    <>
    <Router>
      <Nav></Nav>
      <div className="wrapper">
          

         <Switch>
            <Route exact path="/" component={()=><Dashboard name={"Dashboard"}/>} />
            <Route path="/rules" component={()=> <Automation name={"Rules"}/>} />
            <Route path="/settings" component={()=> <Settings name={"Settings"}/>} />
            <Route component={NoMatch} />
          </Switch>
         
      </div>
      </Router>
    </>
  )

}

