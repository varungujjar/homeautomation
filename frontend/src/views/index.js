import React from "react";
import { SideNav, MobileNav } from "./common/nav";
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { Dashboard } from "./dashboard";
import { Rules, RuleEdit } from "./rules";
import { Components, ComponentsEdit } from "./settings/components";
import { Rooms, RoomsEdit } from "./settings/rooms";
import { Settings } from "./settings";

import { Timeline } from "./timeline";


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
        <div className="layout-sidenav">
          <SideNav></SideNav>
        </div>
      
        <div className="layout-body">
            <Switch>
              <Route exact path="/" render={() => <Dashboard name={"Dashboard"} icon="home" />} />
              <Route exact path="/rules" render={() => <Rules name={"Rules"} icon="list-alt" />} />
              <Route exact path="/timeline" render={() => <Timeline name={"Timeline"} icon="list-alt" />} />
              <Route exact path="/rules/:id" render={(props) => <RuleEdit {...props} name={"Rule Edit"} icon="list-alt" />} />
              <Route exact path="/settings/components/:id" render={(props) => <ComponentsEdit {...props} name={"Component Edit"} icon="list-alt" />} />
              <Route exact path="/settings/rooms/:id" render={(props) => <RoomsEdit {...props} name={"Rooms Edit"} icon="list-alt" />} />
              <Route path="/settings/:category" render={(props) => <Settings  {...props} name={"Settings"} icon="cog" />} />
              <Route component={NoMatch} />
            </Switch>
        </div>
        <MobileNav></MobileNav>
        
    </>
  )
}
