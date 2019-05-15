import React, { Component } from 'react';

// first we will make a new context
export const ContextData = React.createContext();


const checkInArray = (needle, haystack) => {
  var length = haystack.length;
  for(var i = 0; i < length; i++) {
      if(haystack[i] == needle)
          return true;
  }
  return false;
}

// Then create a provider Component
export class Provider extends Component {
  constructor(props) {
      super(props);
      this.state = { 
        deviceId:[]
       }
  }
  
  render() {
    return (
      

      <ContextData.Provider value={{
        state:this.state,
        setStream:(id) => {

          if(!checkInArray(id,this.state.deviceId)){
            this.state.deviceId.push(id)
          }
          
          this.setState({
            deviceId:this.state.deviceId
          })
        }
      }}>
        {this.props.children}
      </ContextData.Provider>
    )
  }
}