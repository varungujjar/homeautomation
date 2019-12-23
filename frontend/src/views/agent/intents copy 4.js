import React, { Component } from "react";
import { Link, Redirect } from 'react-router-dom';
import { Header } from "../common/header";
import { TabHeads } from "./index";
import { Notification } from "../../system/notifications";
import { Formik } from 'formik';
import { Form } from "../../system/formelements";
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import ReactDOM from 'react-dom';

import {
    CompositeDecorator,
    ContentBlock,
    SelectionState,
    ContentState,
    Editor,
    DefaultDraftBlockRenderMap,
    EditorState,
    convertFromHTML,
    moveSelectionToEnd,
    moveFocusToEnd,
    genKey,
    getVisibleSelectionRect,
    getSafeBodyFromHTML, 
    convertToRaw} from 'draft-js';
import { Map, List } from 'immutable';

export class Intents extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            list: [],
            dataLoaded: false,
            trainStatus:false,
            confidence:0,
        }
    }

    
    buildAgent = () =>{
        fetch(`/api/train`)
            .then(response => response.json())
            .then((result) => {
                        if(result){  
                            this.setState({
                                trainStatus:result
                            })
                                Notification(`${result ? "success" : "warning"}`,"Agent Training",`${result ? "Trained Successfully" : "Exhausted Trainning"}`)
                        }else{
                                Notification("error","Agent Training","There was an error publishing")
                        }
            })
            .catch((error) => {
                console.error(error)
            })

    }


    


    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.getConfidence();
            fetch("/api/intents")
                .then(response => response.json())
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({
                            list: result.sort((a, b) => b.id - a.id),
                            dataLoaded: true
                        });
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }   

    
    getConfidence = () => {
        const agent_id = 1;
        if (this._isMounted) {
            fetch(`/api/agents/${agent_id}`)
                .then(response => response.json())
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({
                            confidence: result.confidence_threshold,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }

    handleConfidence= (value) =>{
            const agent_id = 1;
            const agent_data = {
                'id':agent_id,
                'confidence_threshold':parseFloat(Math.round(value * 100) / 100).toFixed(2) 
            }
            fetch(`/api/agents/${agent_id}/save`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agent_data)
            })
                .then(response => response.json())
                .then((result) => {
                    if(result!==false){
                        Notification("success","Saved","Agent confidence changed")
                    }else{
                        Notification("error","Error","There was an error updating confidence")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })

    }


    componentWillUnmount() {
        this._isMounted = false;
    }



    render() {
        return (
            <div className={`tab-pane fade ${this.props.active ? "show active" : ""}`} id="intents" role="tabpanel" aria-labelledby="intents-tab">
                <div className="mt-4 border-rounded">
            
                
                <div className="row">
                <div className="col-md-4"> <button className="btn btn-info mb-3" onClick={()=> this.buildAgent()}>Build Agent</button></div>
                <div className="col-md-4"></div>
                <div className="col-md-4">
                    
                    <div className="p-all">


                    
                    <InputRange
          maxValue={1}
          minValue={0}
          step={0.01}
          value={this.state.confidence}
          onChange={value => this.setState({ confidence:value })}
          onChangeComplete={value => this.handleConfidence(value)} />
            </div>

        </div>
                </div>
                
                   
                {
                    this.state.dataLoaded ?
                        (
                            this.state.list.map((item, index) => {
                                return (
                                    
                                            <div className="p-all-less list-item" key={index}>
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="p-all-less">
                                                            <span className="icon-1x icon-bg-success text-bold icon-left">{item.name.charAt(0)}</span>
                                                            <div className="text-bold">{item.name ? item.name : "..."} <span className="text-secondary"></span></div>
                                                            <div><span className="text-secondary">{item.intentId ? item.intentId : ""} - {item.training ? item.training.length : ""} Training Data</span> </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 text-right v-center">
                                                    </div>
                                                    <div className="col-md-4 text-right v-center">
                                                        <div className="action-buttons">
                                                            <Link to={{ pathname: `/agent/intents/${item.id}` }} className="btn-action icon-1x icon-bg-default icon-edit text-bold"></Link>
                                                            <span className="btn-action icon-1x icon-bg-default icon-trash text-bold" onClick={() => this.deleteRule(item.id)}></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                       
                                )
                            })
                        ) : (
                            <>
                                Nothing here
                    </>
                        )
                }
             </div>
        </div>
        )
    }
}



export class IntentsEdit extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            dataLoaded: false,
            id:0,
            name:"",
            intentId:"",
            speechResponse:"",
            parameters:[],
            training:[]
        }
        this.showEntitySelect=false;
        this.textIsSelected = false;
        this.entities = [];
        this.addRemoveEntity = this.addRemoveEntity.bind(this);
        //this.contentEditable = React.createRef();
        //this.focus = () => this.refs.editor.focus();
        this.onEntityMouseOver = this.onEntityMouseOver.bind(this);
        this.closeEntitySelector = this.closeEntitySelector.bind(this);
    }


    addIndexMap = (dataArray) => {
        let result = [];
        var mergeJSON = require("merge-json");               
        dataArray.map((arrayItem, index)=>{
            const addIndex = {"indexMap":index}
            var dataMerged = mergeJSON.merge(addIndex, arrayItem);
            result[index]= dataMerged
        })
        return result;
    }


    componentDidMount() {    
        this._isMounted = true;
        if (this._isMounted) {
            if (this.props.match.params.id != 0) {
                fetch(`/api/intents/${this.props.match.params.id}`)
                    .then(response => response.json())
                    .then((result) => {
                        fetch(`/api/entities`)
                                .then(response => response.json())
                                .then((entitiesResult) => {
                                    this.entities = entitiesResult;
                                    let trainingData = [];
                                    result.training.map((item,index)=>{
                                        const blocksFromHTML = convertFromHTML(item.text);      
                                        const state = ContentState.createFromBlockArray(
                                            blocksFromHTML.contentBlocks,
                                            blocksFromHTML.entityMap,
                                        );
                                        const compositeDecorator = new CompositeDecorator([
                                            {
                                            strategy: (contentBlock, callback, contentState) => this.handleStrategy(contentBlock, callback, contentState,item),
                                            component:(props) => this.HandleSpan(props,item,index),
                                            //props: { entities: item.entities }
                                            }
                                        ]);                                    
                                        trainingData[index] = {
                                            text:item.text,
                                            entities:item.entities,
                                            editorState:EditorState.createWithContent(state,compositeDecorator)
                                        }
                                    })
                                    this.setState({
                                        dataLoaded: true,
                                        id:result.id,
                                        name:result.name,
                                        intentId:result.intentId,
                                        speechResponse:result.speechResponse,
                                        parameters:this.addIndexMap(result.parameters),
                                        training:trainingData
                                    })

                            })

                            
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            } else {
                this.setState({
                    dataLoaded: true,
                    allLoaded:true
                })
            }
        }
    }
    


    handleStrategy(contentBlock, callback, contentState, item) {
            item.entities.forEach(entity => {
                callback(entity.begin === -1 ? 0 : entity.begin, entity.end);
        });
    }



    HandleSpan = (props,item,trainingIndex) => {
        console.log(props)
        let curEntityIndex = null;
        let startOffset = null;
        let endOffset = null;
        item.entities.map((itemData,prevIndex)=>{
            if(props.decoratedText==itemData.value && props.start == (itemData.begin === -1 ? 0 : itemData.begin)){ //first we find a match from state-entities cause you cannot pass args from startegy to componen
                this.entities.map((entity,index)=>{ //now we map the entities to get the actual entity index from the match above
                    if(itemData.name==entity.name)
                        curEntityIndex = index;
                        startOffset = itemData.begin
                        endOffset = itemData.end
                })

            }
        })
        return (
            <span className={`tagged-slot-container tag-style-${curEntityIndex} tag-offset-${props.offsetKey}`} data-offset-key={props.offsetKey}  onMouseOver={()=>this.onEntityMouseOver(trainingIndex,curEntityIndex, props.decoratedText,`tag-offset-${props.offsetKey}`,startOffset, endOffset)}>
              {props.children}
            </span>
          );
      };
    
    
    onEntityMouseOver = (trainingIndex, curEntityIndex, entityText,className,startOffset,endOffset) => {
        this.showEntitySelect=true;
        if(!this.textIsSelected){
            this.openEntitySelector(trainingIndex,curEntityIndex ,entityText,className,startOffset,endOffset);
        }
    }  


    addTrainingData = (setFieldValue) => {
        const trainingTemplate = {
            text:"",
            entities:[],
            editorState:EditorState.createEmpty()
        }


        const newTraining = this.state.training.slice()
        newTraining.unshift(trainingTemplate);
        this.state.training = newTraining;
        setFieldValue(this.state.training)
    }


    deleteTrainingData = (setFieldValue,index) => {
        const newTraining = this.state.training.slice()
        newTraining.splice(index, 1)
        this.state.training = newTraining;
        setFieldValue(this.state.training)
    }

    
    getSelectionText = (trainingIndex,editorState) => {
        var selectionState = editorState.getSelection();
        var anchorKey = selectionState.getAnchorKey();
        // var AnchorOffset = selectionState.getAnchorOffset();
        var currentContent = editorState.getCurrentContent();
        var currentContentBlock = currentContent.getBlockForKey(anchorKey);
        var startOffset = selectionState.getStartOffset();
        var endOffset = selectionState.getEndOffset();
        var selectedText = currentContentBlock.getText().slice(startOffset, endOffset);
        const wordLength = selectedText.length;
        if(wordLength>0){
            this.showEntitySelect=true;
            this.textIsSelected = true;
            this.openEntitySelector(trainingIndex,-1,selectedText,null,startOffset, endOffset);
        }else{
            this.closeEntitySelector();
        }
    }


    openEntitySelector = (trainingIndex,curEntityIndex,entityText,className=null,startOffset=null,endOffset=null)=>{
        if(this.showEntitySelect){
            let childPos = null;
            const parentPos = document.getElementById('draftDropdown').getBoundingClientRect();

            if(className){
                childPos = document.getElementsByClassName(className)[0].getBoundingClientRect();
            }else{
                childPos = getVisibleSelectionRect(window);
            }

            if(childPos!==null){
                const styles = {
                    top: childPos.top - parentPos.top + 330,
                    left: childPos.left - 250
                };

                let renderHTML = (
                    <div className="dropdown" style={styles}>
                        <button type="button" onClick={()=>this.closeEntitySelector()}>Close</button>
                        <div> Anoting word : {entityText}</div>
                         <ul>
                             {
                                this.entities.length > 0 ?
                                this.entities.map((entity,index)=>{
                                        return(<li className={curEntityIndex===index ? "active" : ""} key={index} onClick={()=>this.addRemoveEntity(trainingIndex,index,entityText,startOffset,endOffset)}>{entity.name}</li>)
                                }) : null
                             }
                             </ul>   
                    </div>
                )
                
                let timeout = 500;

                setTimeout(() => {
                    ReactDOM.render(
                        renderHTML,
                        document.getElementById("draftDropdown")
                        );
                  }, timeout);
                }
                
        }else{
            ReactDOM.render(<></>, document.getElementById("draftDropdown"));
        }
    }


    closeEntitySelector = () => {
        this.showEntitySelect = false;
        this.textIsSelected = false;
        this.openEntitySelector(null,0,null,null);
    }
    
    getEntityData = (index) => {
        return this.entities[index];
    }


    addRemoveEntity = (trainingIndex,newEntityIndex,entityText,startOffset,endOffset) => {
        let entities = this.state.training[trainingIndex].entities;        
        const newEntityName = this.entities[newEntityIndex].name;

        let entityTemplate = {}
        if((startOffset==0 || startOffset) && endOffset){
            entityTemplate = {
                "value":entityText.trim(),
                "begin":startOffset === 0 ? -1 : startOffset,
                "end":endOffset,
                "name":newEntityName.trim(),
            }
        }

        let newEntitiesList = [];
        entities.map((entity,index)=>{
            if(entity.begin >= startOffset && entity.begin <= endOffset || entity.end >= startOffset && entity.end <= endOffset){
            }else{
                newEntitiesList.push(entity);
            }
        })
        newEntitiesList.push(entityTemplate);

        let stateTraining = [...this.state.training];
        stateTraining[trainingIndex] = {...stateTraining[trainingIndex],"entities":newEntitiesList}

        const compositeDecorator = new CompositeDecorator([
        {
            strategy: (contentBlock, callback, contentState) => this.handleStrategy(contentBlock, callback, contentState,stateTraining[trainingIndex]),
            component:(props) => this.HandleSpan(props, stateTraining[trainingIndex], trainingIndex),
        }
        ]); 
        
        let editorState = stateTraining[trainingIndex].editorState;
        editorState = EditorState.set(editorState, {decorator: compositeDecorator});  
        stateTraining[trainingIndex] = {...stateTraining[trainingIndex],editorState}

        this.setState({
            training:stateTraining
        })
        this.closeEntitySelector();
    }

   

    // editorOnBlur = () => {
    //     this.showEntitySelect = false;
    //     if(!this.textIsSelected){
    //         this.closeEntitySelector();
    //     }
    // }


    editTrainingData = (editorState,setFieldValue,index) => {
        const trainingIndex = index;
        this.getSelectionText(trainingIndex, editorState);
        const getText = editorState.getCurrentContent().getPlainText('');
        let stateTraining = [...this.state.training];
        const entities = this.state.training[index].entities;
        let newEntitiesList = [];
        entities.map((entity)=>{
            const findWord = new RegExp("\\b" + entity.value + "\\b").test(getText)
            if(findWord){
                newEntitiesList.push(entity);  
            }
        });

        stateTraining[index] = {...stateTraining[index],"text":getText, "entities":newEntitiesList}
        
        const compositeDecorator = new CompositeDecorator([
        {
            strategy: (contentBlock, callback, contentState) => this.handleStrategy(contentBlock, callback, contentState,stateTraining[index]),
            component:(props) => this.HandleSpan(props, stateTraining[index], index),
        }
        ]); 

        editorState = EditorState.set(editorState, {decorator: compositeDecorator});  
        stateTraining[index] = {...stateTraining[index],editorState}

        this.setState({
            training:stateTraining
        })
        setFieldValue(this.state.training[index])
    }


    saveFormData = (data) => {
        fetch(`/api/intents/${this.id}/save`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((result) => {
                if(result!==false){
                    Notification("success","Saved","Intent Saved Successfully")
                }else{
                    Notification("error","Error","There was an error saving")
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }



    cleanFormData = (formValues) => {
        let result = {};
        result["id"]= formValues.id;
        result["name"]= formValues.name;
        result["intentId"]= formValues.intentId;
        result["parameters"]= formValues.parameters;
        result["speechResponse"]= formValues.speechResponse;
        let trainingData = []
        formValues.training.map((train,index) => {
            trainingData[index] = {
                text:train.text,
                entities:train.entities
            }
        })
        result["training"]= trainingData;
        return result;
        // let cleanForm = {}
        // for (let [key, value] of Object.entries(formValues)) {
        //     if(key!=="dataLoaded"){
        //         cleanForm[key]=value;
        //     }
        // }
        // return cleanForm;
    }


    render() {
        return (
            <>
                <Header name="Intents" icon="fal fa-atom"></Header>
                <div className="wrapper">
                <TabHeads active="intents" disabled="1" />
                {
                    this.state.dataLoaded && (
                        <Formik
                            enableReinitialize
                            initialValues={this.state}
                            // validate={}
                            onSubmit={(values, { setSubmitting }) => {
                                const getCleanFormData = this.cleanFormData(values);
                                this.saveFormData(getCleanFormData);
                                console.log(getCleanFormData);
                                setSubmitting(false);
                            }}
                            handleChange={(event) => {
                            }}
                        >
                            {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                setFieldValue,
                                handleSubmit,
                                isSubmitting,
                            }) => (
                                <form onSubmit={handleSubmit}>
                                <div className="card card-shadow mt-3">
                                <div className="card-header">
                                    Edit Intent
                                    </div>
                                    <div className="card-body">

                                    <input className="form-control" value={values.id} name="id" onChange={handleChange} type="hidden" />
                                    <input className="form-control" value={values.name} name="name" onChange={handleChange} type="text" />
                                    <input className="form-control" value={values.intentId} name="intentId" onChange={handleChange} type="text" />
                                    <input className="form-control" value={values.speechResponse} name="speechResponse" onChange={handleChange} type="text" />



                                    <div className="mt-4">
                                    <button className="btn btn-info" onClick={() => this.addTrainingData(setFieldValue)} type="button">+ Add Training</button>
                                    <div id="draftDropdown"></div>   
                                    
                                    {            
                                        this.state.training.length > 0 ? 
                                        this.state.training.map((data,index) => {

                                
                                           
                                            return(

                                                <div className="row mb-3" key={index}>
                                                <div className="col-md-12">
                                                    <div className="row">
                                                        <div className="col-md-10">
                                                        <Editor 
                                                        // customStyleMap={styleMap}
                                                        editorState={this.state.training[index].editorState} 
                                                        onChange={(editorState)=>this.editTrainingData(editorState,setFieldValue,index)}
                                                        // onBlur={()=>this.editorOnBlur()}
                                                        // onFocus={()=>this.onEditorFocus()}
                                                        // blockStyleFn={this.myBlockStyleFn} //Adds Classes to wrappers for tags
                                                        // ref="editor"
                                                        // blockRendererFn={this.blockRendererFn} //Before rendering wraps the text 
                                                        // blockRenderMap={blockRenderMap}
                                                         />
                                                       
                                                        </div>
                                                        
                                                        <div className="col-md-2">
                                                            <button type="button" className="btn btn-primary" onClick={()=>this.deleteTrainingData(setFieldValue,index)}>X</button>
                                                        </div>

                                                    </div>
                                                    {

data.entities.length > 0 ?
data.entities.map((entity,index)=>{
    return(
        <div className="row" key={index}>
            <div className="col-md-6">{entity.value}</div>
            <div className="col-md-4">{entity.name}</div>
            <div className="col-md-2">X</div>

        </div>    
        )

}) : null
}
                                                </div>
                                                </div>
                                            )
                                            })
                                      : null          
                                    }
                                    </div>

                                    </div>
                                    <div className="card-footer">
                                    <div className="btn-group">

                                    <button type="submit" disabled={isSubmitting} className={`btn btn-info`}>
                                    <i className="fas fa-check-circle"></i> Save Intent
                                    </button>

                                    <Link to={{ pathname: `/agent/intents`, data: null }} className="btn btn-default">Cancel</Link>
                                    </div>
                                    </div>
                                </div>
                            </form>
                                )}
                        </Formik>
                    )
                }
            </div>
            </>
        )
    }
}
