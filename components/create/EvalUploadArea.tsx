import { FunctionComponent } from "react";
import { Evaluation } from "../../types/Evaluation";
import { Judge } from "../../types/Judge";
import FileUpload from "./FileUpload";

export const EvalUploadArea: FunctionComponent<{addEval: Function, judge: Judge}> = ({addEval, judge}) => {
    const processInput = (csvInput: string) => {
      // need to write!
      // format is t, r, [scores], weight?=0, isimp, isprel
      let lines = (csvInput.match(/.+/g) || ["FAILED"])
      if(lines[0]=="FAILED") return;
     
      let allEvals: Array<Evaluation> = [];
      let evaluations = lines.slice(1);
      for(let line of evaluations) {
        if(line.indexOf(",")==-1) return;
        let data = line.split(",");
        const trueish: string[] = ["yes", "true", "oui", "si", "y", "t"];
        allEvals.push({tournamentName: data[0], date: new Date().toString(), roundName: data[1], isPrelim: trueish.includes(data[3].toLowerCase()), isImprovement: trueish.includes(data[2].toLowerCase()), decision: parseFloat(data[7]), comparison: parseFloat(data[6]), citation: parseFloat(data[5]), coverage: parseFloat(data[4]), bias: parseFloat(data[8]), weight: 1});
      }
      addEval(allEvals);
    }

    const exportRatings = (j: Judge): string => {
      let data = "tournamentName,roundName,isImprovement,isPrelim,coverage,citation,comparison,decision,bias\n"; // rewrite this line
      return j.evaluations.reduce((accum, e) => 
        accum+`${e.tournamentName},${e.roundName},${e.isImprovement},${e.isPrelim},${e.coverage},${e.citation},${e.comparison},${e.decision},${e.bias}\n`,
        data
      );
    }
  
    const downloadRatings = () => {
      let data = exportRatings(judge); // rewrite this line
      data = 'data:text/csv;charset=utf-8,' + encodeURI(data);
      let fileName = `exported_evaluations_${judge.name}.csv`;
      saveAs(data, fileName)
    }

    const downloadTemplate = () => {
      let data = "tournamentName,roundName,isImprovement,isPrelim,coverage,citation,comparison,decision,bias\n"; // rewrite this line
      data = 'data:text/csv;charset=utf-8,' + encodeURI(data);
      let fileName = `evaluations_template.csv`;
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
      <div>Upload Evaluations from File: <FileUpload callback={processInput} typesToAllow={".csv"}/></div>
      <div>Download Evaluations: <button onClick={(_) => downloadRatings()}>Download All Ratings</button></div>
      <div>Download Template: <button onClick={(_) => downloadTemplate()}>Download Template</button></div>
    </div>)
  }