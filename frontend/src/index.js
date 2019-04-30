import React, { Component } from "react";
import { connect, device, notification } from "./api";
import ReactDOM from 'react-dom';
// import logo from "./logo.svg";
// import "./App.css";




function LogConsole(props){
    return (
    <div className="someclass">{props.logdata}</div>
    );
}


class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        connect:null,
        device:null,
        notification:null,
        items:[],
        isLoaded:false
      }
      
      device(data => {
        this.setState({device: data});
      });

      notification(data => {
        this.setState({notification: data});
      });

      connect(data => {
        this.setState({connect:data});
      });
  }


  componentDidMount() {
    console.log("doing this");
    fetch("/api/rooms")
      .then(response => response.json())
      .then((result) => {
        console.log(result);
        this.setState({
          isLoaded:true,
          items:result
        });
        
      })
      .catch((error) => {
        // handle your errors here
        console.error(error)
      })
      console.log(this.state.isLoaded);
      console.log(this.state.items);
  }

  

  componentWillMount(){
    console.log('Loading Page...');
  }


   render() {
    const {items } = this.state;
      return (
        <div className="App">
          <header className="App-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <div id="connection">{this.state.connect}</div>
          <div id="device">{this.state.device}</div>
          <div id="notification">{this.state.notification}</div>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                {item.name} {item.description}
              </li>
            ))}
          </ul>
          {/* <LogConsole logdata={this.state.ioData} /> */}
        </div>
      );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));