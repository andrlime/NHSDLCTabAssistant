import { FunctionComponent } from "react";
import { Judge } from "../../types/Judge";
import FileUpload from "./FileUpload";

export const JudgeUploadArea: FunctionComponent<{addJudge: Function}> = ({addJudge}) => {
    const processInput = (csvInput: string) => {
      // need to write!
      // format is name, email\n $name, $email
      let lines = (csvInput.match(/.+/g) || ["FAILED"])
      if(lines[0]=="FAILED") return;
     
      let allJudgesArray: Array<Judge> = [];
      let judges = lines.slice(1);
      for(let line of judges) {
        if(line.indexOf(",")==-1) return;
        let data = line.split(",");
        let name = data[0];
        let email = data[1];
        let rx = /((\w|[-]|[.])+[@]\w+([.]\w+)+)/g; //tests if it's an email
        if(!email.match(rx)) continue; // not a valid email
  
        allJudgesArray.push({_id: "REFRESH TO SEE", name: name, email: email, evaluations: []});
      }
      addJudge(allJudgesArray);
    }
  
    const downloadSample = () => {
      let data = "name,email\n";
      data = 'data:text/csv;charset=utf-8,' + encodeURI(data);
      let fileName = `judge_template.csv`;
      saveAs(data, fileName)
    }
  
    const saveAs = (blob: any, fileName: string) =>{
      let elem = window.document.createElement('a');
      elem.href = blob
      elem.download = fileName;
      (document.body || document.documentElement).appendChild(elem);
      if (typeof elem.click === 'function') {
        elem.click();
      } else {
        elem.target = '_blank';
        elem.dispatchEvent(new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        }));
      }
      URL.revokeObjectURL(elem.href);
      elem.remove()
    }
  
    return (<div>
      <div>Upload Judges from File: <FileUpload callback={processInput} typesToAllow={".csv"}/></div>
      <div>Download Template: <button onClick={(_) => downloadSample()}>Download</button></div>
    </div>)
  }