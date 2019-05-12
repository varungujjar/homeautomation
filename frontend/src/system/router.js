import React  from "react";
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Dashboard } from "../layout/dashboard";
import { Automation } from "../layout/automation";
import { Settings } from "../layout/settings";

export const Routing = (
  <Router>      
        <Route exact path="/" component={()=><Dashboard name={"Dashboard"}/>} />
        <Route path="/automation" component={()=> <Automation name={"Automation"}/>} />
        <Route path="/settings" component={()=> <Settings name={"Settings"}/>} />
  </Router>
)