import React from "react";
import { SideNav, MobileNav } from "./common/nav";
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { Dashboard } from "./dashboard";
import { Rules, RuleEdit } from "./rules";
import { Settings } from "./settings";
import { Horizon } from "./dashboard/horizon";
import { Weather } from "./dashboard/weather";
import { Home } from "./dashboard/home";


function NoMatch({ location }) {
  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
}


export const Views = () => {
  return (
    <>
      <Router>
        <div className="layout-sidenav">
          <SideNav></SideNav>
        </div>
        <div className="layout-highlight">
          <Home></Home>
          <Weather></Weather>
          <Horizon></Horizon>
        </div>
        <div className="layout-body">
          <div className="wrapper">
            <Switch>
              <Route exact path="/" render={() => <Dashboard name={"Dashboard"} icon="home" />} />
              <Route exact path="/rules" render={() => <Rules name={"Rules"} icon="list-alt" />} />
              <Route exact path="/rules/:id" render={(props) => <RuleEdit {...props} name={"Rule Edit"} icon="list-alt" />} />
              <Route path="/settings" render={() => <Settings name={"Settings"} icon="cog" />} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </div>
        <MobileNav></MobileNav>
      </Router>
    </>
  )
}
