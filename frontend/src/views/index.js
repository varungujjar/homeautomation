import React from "react";
import { SideNav, MobileNav } from "./common/nav";
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import { Dashboard } from "./dashboard";
import { Rules, RuleEdit } from "./rules";
import { Components, ComponentsEdit } from "./settings/components";
import { Intents, IntentsEdit } from "./agent/intents";
import { Entities, EntitiesEdit } from "./agent/entities";
import { Rooms, RoomsEdit } from "./settings/rooms";
import { Settings } from "./settings";
import { Agent } from "./agent";
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
              <Route exact path="/timeline" render={() => <Timeline name={"Timeline"} icon="stream" />} />
              <Route exact path="/rules/:id" render={(props) => <RuleEdit {...props} name={"Rule Edit"} icon="list-alt" />} />


              <Route exact path="/settings/components/:id" render={(props) => <ComponentsEdit {...props} name={"Component Edit"} icon="list-alt" />} />
              <Route exact path="/settings/rooms/:id" render={(props) => <RoomsEdit {...props} name={"Rooms Edit"} icon="list-alt" />} />
              <Route path="/settings/:category" render={(props) => <Settings  {...props} name={"Settings"} icon="cog" />} />
              <Route path="/settings" render={(props) => <Settings  {...props} name={"Settings"} icon="cog" />} />

              <Route exact path="/agent/intents/:id" render={(props) => <IntentsEdit {...props} name={"Intent Edit"} icon="list-alt" />} />
              <Route exact path="/agent/entities/:id" render={(props) => <EntitiesEdit {...props} name={"Entity Edit"} icon="list-alt" />} />
              <Route path="/agent/:category" render={(props) => <Agent  {...props} name={"Agent"} icon="atom" />} />
              <Route path="/agent" render={(props) => <Agent  {...props} name={"Agent"} icon="atom" />} />

              <Route component={NoMatch} />
            </Switch>
        </div>
        <MobileNav></MobileNav>
        
    </>
  )
}
