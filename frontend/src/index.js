import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Notification } from "./system/notifications";
import { Layout } from "./layout";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

import 'bootstrap/dist/css/bootstrap.min.css'
import "./assets/common/css/all.min.css"
import "./assets/common/css/owl.carousel.min.css"
import "./assets/common/css/owl.theme.default.min.css"
import "./assets/common/css/toast.css"
import "./assets/common/css/toast.css"
import "./assets/common/css/tabs.css"
import "./assets/common/css/icons.css"
import "./assets/light/css/app.css"



class App extends Component {
  constructor(props) {
    super(props);
  }

   render() {
      return (
        <div className="App">
           <Layout></Layout>
           <Notification/>
        </div>
      );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));