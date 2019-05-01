import React, { Component } from "react";
import { connect, device, notification } from "./api";
import ReactDOM from 'react-dom';
import { Layout } from "./layout"
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
          <Layout name={"Dashboard"}></Layout>
        </div>
      );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));