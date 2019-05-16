import React  from "react";
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Dashboard } from "../layout/dashboard";
import { Rules } from "../layout/rules";
import { Settings } from "../layout/settings";

export const Routing = (
  <Router>      
        <Route exact path="/" component={()=><Dashboard name={"Dashboard"}/>} />
        <Route path="/rules" component={()=> <Rules name={"Rules"}/>} />
        <Route path="/settings" component={()=> <Settings name={"Settings"}/>} />
  </Router>
)