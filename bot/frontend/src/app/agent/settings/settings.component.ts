import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import {IntentService} from '../../services/intent.service'
import {AgentsService} from '../../services/agents.service'
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  
  fileToUpload: File = null;
  config_form =  this.fb.group({
    "id":"",
    "name":"",
    "modified":"",
    "confidence_threshold":[]
  });

  constructor(private intentService:IntentService,private agent_service:AgentsService,  
    public fb: FormBuilder,private utilsService:UtilsService) { }

  code = ``

  ngOnInit() {
    this.agent_service.get_config().then(
    (result)=>{
      this.config_form.setValue(result);
    }
    )
  }

  threshold_value_changed(){
    this.save_config()
  }

  save_config(){
    this.agent_service.update_config(this.config_form.value)
    console.log(this.config_form.value)
  }

 

uploadFileToActivity() {
  this.utilsService.displayLoader(true)
  this.intentService.importIntents(this.fileToUpload).then ((result)=>{
    this.utilsService.displayLoader(false)
    console.log(result)
  })
}

}
