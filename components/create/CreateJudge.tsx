import axios from "axios";
import { FunctionComponent, useState, useRef, useEffect } from "react";
import { Judge } from "../../types/Judge";
import { FileUploadArea } from "./FileUploadArea";
import styles from '../../styles/Q.module.css';

export const CreateJudge: FunctionComponent<{callback: Function, addALot: Function}> = ({callback, addALot}) => {
    const [judgeName, setJudgeName] = useState("");
    const [judgeEmail, setJudgeEmail] = useState("");
    const backendUrl = useRef("");
    const apiKey = useRef("");

    const addJudges = (listOfJudgesToAdd: Judge[])=> {
        addALot(listOfJudgesToAdd);
    }
  
    useEffect(() => {
      // get the total weight of all rounds
      axios.get("/api/getkey").then((res)=> {
        backendUrl.current = res.data.backendUrl || "";
        apiKey.current = res.data.apiKey || "";
      });
    },[]);
  
    return (<div className={styles.sublabel} style={{paddingLeft: "0rem", flexDirection: "column"}}>
  
      <div className={styles.createform}>
        <div style={{margin: "0.15rem"}}>Judge Name: <input value={judgeName} onChange={(e) => setJudgeName(e.target.value)} type={'text'} style={{width: "100%"}}></input></div>
        <div style={{margin: "0.15rem"}}>Judge Email: <input value={judgeEmail} onChange={(e) => setJudgeEmail(e.target.value)} type={'text'} style={{width: "100%", borderColor: !judgeEmail.match(/((\w|[-]|[.])+[@]\w+([.]\w+)+)/g) ? "red" : ""}}></input></div>
      </div>
      <div className={styles.createform} style={{flexDirection: "column"}}>
        <button style={{width: "fit-content"}} onClick={(_) => {
          let body = {
            apikey: apiKey.current,
            name: judgeName,
            email: judgeEmail
          };
  
          if ( !judgeEmail.match((/((\w|[-]|[.])+[@]\w+([.]\w+)+)/g)) ) return;
  
          else {
            axios.post(`https://${backendUrl.current}/create/judge`, body).then((res) => {
              callback({
                _id: res.data.result.insertedId,
                name: judgeName,
                email: judgeEmail,
                evaluations: [],
                totalEarnedPoints: 0,
                totalPossiblePoints: 1
              });
            })
          }
        }}>Create Judge</button>
  
        <FileUploadArea addJudge={addJudges}/>
      </div>
  
    </div>);
  }