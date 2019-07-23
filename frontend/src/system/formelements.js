import React from "react";


export const Form = (props) =>{
  if(props.type=="text"){
      return(
        <Text {...props}/>
      )
  }
  else if(props.type=="number"){
    return(
      <Number {...props}/>
    )
  }
  else if(props.type=="boolean"){
    return(
      <Boolean {...props}/>
    )
  }
  else if(props.type=="timezone"){
    return(
      <Timezone {...props}/>
    )
  }
  else{
    return(null)
  }
}

const Text = (props) => {
  return(
    <>
    <label>{props.label}</label>
    <input className="form-control" value={props.value} name={props.name} onChange={props.handleChange} type="text" />
    </>
  )
}


const Timezone = (props) => {
  return(
    <>
    <label>{props.label}</label>
    <input className="form-control" value={props.value} name={props.name} onChange={props.handleChange} type="text" />
    </>
  )
}

const Number = (props) => {
  return(
    <>
    <label>{props.label}</label>
    <input className="form-control" value={props.value} name={props.name} onChange={props.handleChange} type="number" />
    </>
  )
}


const Boolean = (props) => {
  return(
    <>
    <label>{props.label}</label>
    <select name={props.name} value={props.value} onChange={props.handleChange} className="form-control" >
    <option value="True">True</option>
    <option value="False">False</option>
    </select>
    </>
  )
}