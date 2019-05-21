import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Notification } from "./system/notifications";
import { Views } from "./views";
import { Provider } from "./system/provider";
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import "bootstrap/dist/js/bootstrap.bundle.min.js";

import 'bootstrap/dist/css/bootstrap.min.css'
import "./assets/common/css/all.min.css"
import "./assets/common/css/light.min.css"
import "./assets/common/css/slick.min.css";
import "./assets/common/css/slick-theme.min.css";
import "./assets/common/css/toast.css"
import "./assets/common/css/tabs.css"
import "./assets/common/css/icons.css"
import "./assets/light/css/app.css"


class App extends Component {
   render() {
      return (
       
        <Provider>
           <Router>
            <div className="App">
              <Views></Views>
              <Notification/>
            </div>
          </Router>
        </Provider>
       
      );
    }
}

ReactDOM.render(<App />, document.getElementById('root'))