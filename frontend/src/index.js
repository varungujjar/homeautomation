import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Layout } from "./layout/main";
import { Notification } from "./system/notifications";

import "../dist/assets/common/css/bootstrap-reboot.min.css"
import "../dist/assets/common/css/bootstrap-grid.min.css"
import "../dist/assets/common/css/owl.carousel.min.css"
import "../dist/assets/common/css/owl.theme.default.min.css"
import "../dist/assets/light/css/app.css"

class App extends Component {
  constructor(props) {
    super(props);
     
  }

   render() {
      return (
        <div className="App">
          <Notification/>
          <Layout name={"Dashboard"}/>
        </div>
      );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));