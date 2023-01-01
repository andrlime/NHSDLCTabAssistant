import axios from "axios";
import { useRouter } from "next/router";
import { FunctionComponent, useState, useRef, useEffect } from "react";
import { Judge } from "../../types/Judge";
import styles from '../../styles/Q.module.css';

export const CreateEvaluation: FunctionComponent<{callback: Function, judge: Judge}> = ({callback, judge}) => {
    const [tournament, setTournament] = useState("");
    const [round, setRound] = useState("");
  
    const [dec, setDec] = useState(0.0);
    const [comp, setComp] = useState(0.0);
    const [cit, setCit] = useState(0.0);
    const [cov, setCov] = useState(0.0);
    const [bias, setBias] = useState(0.0);
  
    const [improvement, setImprovement] = useState(false);
    const [prelim, setPrelim] = useState(true);
  
    const backendUrl = useRef("");
    const apiKey = useRef("");

    const storeTournamentNameInCookies = (tournamentName: string) => {
      if(tournamentName=="") return;
      else {
        localStorage.setItem('tname', tournamentName);
      }
    }
  
    const readTournamentNameFromCookies = () => {
      if(localStorage.tname) {
        setTournament(localStorage.tname);
      } else {
        setTournament("");
      }
    }
  
    useEffect(() => {
      axios.get("/api/getkey").then((res)=> {
        backendUrl.current = res.data.backendUrl || "";
        apiKey.current = res.data.apiKey || "";
      });
      readTournamentNameFromCookies();
    },[]);
  
    const { query } = useRouter();
  
    const totalWeight = (j: Judge): number => {
      let s = 0;
      for(let i of j.evaluations) {
        s+=i.weight;
      }
  
      return s;
    }
  
    return (<div className={styles.sublabel} style={{paddingLeft: "0rem", flexDirection: "column"}}>
  
      <div className={styles.createform}>
        <div style={{margin: "0.15rem"}}>Tournament Name: <input value={tournament} onChange={(e) => setTournament(e.target.value)} type={'text'} style={{width: "100%"}}></input></div>
        <div style={{margin: "0.15rem"}}>Round Name: <input value={round} onChange={(e) => setRound(e.target.value)} type={'text'} style={{width: "100%"}}></input></div>
      </div>
      <div className={styles.createform}>
        <div style={{margin: "0.15rem"}}>Decision Score: <input value={dec} onChange={(e) => {
          let number = parseFloat(e.target.value) || 0;
          if (number > 1.5) setDec(1.5);
          else if (number < 0) setDec(0);
          else setDec(number);
        }} type={'number'}></input></div>
  
        <div style={{margin: "0.15rem"}}>Comparison Score: <input value={comp} onChange={(e) => {
          let number = parseFloat(e.target.value) || 0;
          if (number > 1.5) setComp(1.5);
          else if (number < 0) setComp(0);
          else setComp(number);
        }} type={'number'}></input></div>
  
        <div style={{margin: "0.15rem"}}>Citation Score: <input value={cit} onChange={(e) => {
          let number = parseFloat(e.target.value) || 0;
          if (number > 1.5) setCit(1.5);
          else if (number < 0) setCit(0);
          else setCit(number);
        }} type={'number'}></input></div>
  
        <div style={{margin: "0.15rem"}}>Coverage Score: <input value={cov} onChange={(e) => {
          let number = parseFloat(e.target.value) || 0;
          if (number > 1.5) setCov(1.5);
          else if (number < 0) setCov(0);
          else setCov(number);
        }} type={'number'}></input></div>
  
        <div style={{margin: "0.15rem"}}>Bias Score: <input value={bias} onChange={(e) => {
          let number = parseFloat(e.target.value) || 0;
          if (number > 1.5) setBias(1.5);
          else if (number < 0) setBias(0);
          else setBias(number);
        }} type={'number'}></input></div>
      </div>
      <div className={styles.createform}>
        <div style={{marginRight: "0.5rem", whiteSpace: "nowrap"}}>Check if this is an improvement or sample round<input checked={improvement} onChange={(_) => setImprovement(!improvement)} type={'checkbox'}/></div>
        <div style={{marginRight: "0.5rem", whiteSpace: "nowrap"}}>Check if this is a prelims round<input checked={prelim} onChange={(_) => setPrelim(!prelim)} type={'checkbox'}/></div>
      </div>
      <div className={styles.createform}>
        <button onClick={(_) => {
          let body = {
            tName: tournament,
            rName: round, // e.g., Round 1 Flight A etc.
            isPrelim: prelim,
            isImprovement: improvement,
            decision: dec,
            comparison: comp,
            citation: cit,
            coverage: cov,
            bias: bias,
            weight: improvement ? totalWeight(judge)*0.25 : 1,
            date: new Date()
          };
  
          callback({
            tournamentName: tournament,
            date: "",
            roundName: round, // e.g., Round 1 Flight A etc.
            isPrelim: prelim,
            isImprovement: improvement,
            decision: dec,
            comparison: comp,
            citation: cit,
            coverage: cov,
            bias: bias,
            weight: improvement ? totalWeight(judge)*0.25 : 1,
          });

          storeTournamentNameInCookies(tournament);
          axios.post(`https://${backendUrl.current}/update/judge/${apiKey.current}/${query.judgeId}`, body).then((_) => {})
        }}>Create Evaluation</button>
      </div>
  
    </div>);
  }