/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useEffect, useState, useRef, FunctionComponent } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import type { Tool } from './typedeclarations';
import axios from 'axios';
import { ObjectId } from 'mongodb';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DeleteButton from '../components/buttons/DeleteButton';
import NavigationBar from '../components/nav/NavigationMenu';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Judge = {
  _id: ObjectId | string,
  name: string,
  email: string,
  evaluations: Evaluation[]
}

type Evaluation = {
  tournamentName: string,
  date: Date | string,
  roundName: string, // e.g., Round 1 Flight A etc.
  isPrelim: boolean,
  isImprovement: boolean,
  decision: number,
  comparison: number,
  citation: number,
  coverage: number,
  bias: number,
  weight: number
}

const CreateForm: FunctionComponent<{callback: Function, judge: Judge}> = ({callback, judge}) => {
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

  useEffect(() => {
    axios.get("/api/getkey").then((res)=> {
      backendUrl.current = res.data.backendUrl || "";
      apiKey.current = res.data.apiKey || "";
    });
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
      <div style={{marginRight: "0.5rem", whiteSpace: "nowrap"}}>Check if this is an improvement round<input checked={improvement} onChange={(_) => setImprovement(!improvement)} type={'checkbox'}/></div>
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
        axios.post(`https://${backendUrl.current}/update/judge/${apiKey.current}/${query.judgeId}`, body).then((_) => {})
      }}>Create Evaluation</button>
    </div>

  </div>);
}

const Home: NextPage = () => {
  const backendUrl = useRef("");
  const apiKey = useRef("");
  const [judge, setJudge] = useState<Judge>();
  const [loaded, setLoaded] = useState(false);

  const [auth, setAuth] = useState(false);

  const pushNewEvaluation = (evaluation: Evaluation) => {
    let j = {_id: judge!._id, name: judge?.name || "", email: judge?.email || "", evaluations: judge?.evaluations || []};
    j.evaluations.push(evaluation);
    setJudge(j);
  };

  const { query } = useRouter();
  useEffect(() => {
    axios.get("/api/getkey").then((res)=> {
      backendUrl.current = res.data.backendUrl || "";
      apiKey.current = res.data.apiKey || "";
      // replace later
      axios.get(`https://${backendUrl.current}/get/judge/${apiKey.current}/${query.judgeId || ""}`).then((res) => {
        setJudge(res.data.result);
        setLoaded(true);
      });
      if(localStorage.us && localStorage.pw) {
        let userpass = `U1A${localStorage.us}P28${localStorage.pw}`;
        axios.get(`https://${backendUrl.current}/auth/${userpass}`).then((res) => {
          if(res.data.auth) {
            setAuth(true);
            localStorage.setItem('us', (query.user || "").toString());
            localStorage.setItem('pw', (query.pass || "").toString());
          }
        });
      } else {
        let userpass = `U1A${query.user}P28${query.pass}`;
        axios.get(`https://${backendUrl.current}/auth/${userpass}`).then((res) => {
          if(res.data.auth) {
            setAuth(true);
            localStorage.setItem('us', (query.user || "").toString());
            localStorage.setItem('pw', (query.pass || "").toString());
          }
        });
      }
    });
  },[query.judgeId, query.user, query.pass]);

  const range = (min: number, max: number): Array<number> => {
    let arr = [];
    for(let i = min; i <= max; i ++) {
      arr.push(i);
    }

    return arr;
  }

  const extract = () => {
    if(!judge) return;

    let arr = [];
    for(let i of judge.evaluations) {
      arr.push(i.bias+i.citation+i.comparison+i.coverage+i.decision);
    }

    return arr;
  }

  const data = {
    labels: range(1,(judge ? judge.evaluations.length : 1)),
    datasets: [
      {
        label: 'Overall Rating',
        data: extract(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  const totalWeight = (j: Judge): number => {
    let s = 0;
    for(let i of j.evaluations) {
      s+=i.weight;
    }

    return s;
  }

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Judge Evaluation System</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <NavigationBar pageIndex={4}/>
      <div className={styles.content}>
        <div className={styles.heading}><Link href="/evaluate"><span>&#9001;</span>&nbsp;&nbsp;&nbsp;</Link>Judge Evaluation System: Judge <span style={{textDecoration: "underline"}}>{loaded ? judge?.name : "Loading..."}</span></div>
        <div className={styles.form} style={{paddingLeft: "0rem", width: "100%"}}>

          <div className={stylesQ.tables} style={{width: "50%"}}>
          
            {loaded ? <div className={styles.form} style={{paddingLeft: "0rem"}}>

              <span className={styles.label}>Performance Over Time</span>
              <Line data={data} />

              <span className={styles.label}>Current Evaluations</span>

              <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.one}>
                <tbody>
                <tr style={{height: "1rem"}}>
                  <td style={{width:"4%"}}>Date</td>
                  <td style={{width:"8%"}}>Tournament Name</td>                  
                  <td style={{width:"8%"}}>Round Name</td>

                  <td style={{width:"13%"}}>Decision</td>
                  <td style={{width:"13%"}}>Comparison</td>
                  <td style={{width:"13%"}}>Citation</td>
                  <td style={{width:"13%"}}>Coverage</td>
                  <td style={{width:"13%"}}>Bias</td>
                  <td style={{width:"15%"}}>Total</td>
                  <td style={{backgroundColor: "#b81818"}}>Delete</td>
                </tr>
                {auth ? (judge?.evaluations || []).map((element,index)=>(
                  <tr key={element.date.toString() || ""}>
                    <td>{element.date.toString() || ""}</td>
                    <td>{element.tournamentName}</td>
                    <td>{element.roundName}</td>

                    <td>{element.decision}</td>
                    <td>{element.comparison}</td>
                    <td>{element.citation}</td>
                    <td>{element.coverage}</td>
                    <td>{element.bias}</td>
                    <td style={{background: "#FEE499"}}>{element.decision+element.comparison+element.citation+element.coverage+element.bias}</td>
                    <td style={{width: "10%"}}><DeleteButton callback={(e: number) => {
                      // delete from frontend view
                      if(!judge) return;

                      let j: Evaluation[] = [];
                      // lazy way because i'm stupid
                      for(let i = 0; i < judge.evaluations.length; i ++) {
                        if ( i!=e ) {
                          j.push(judge.evaluations[i]);
                        }
                      }
                      let newJudge = {_id: judge._id, name: judge.name, email: judge.email, evaluations: j};
                      setJudge(newJudge);
                      // call API route to delete the judge from the database
                      axios.delete(`https://${backendUrl.current}/delete/evaluation/${apiKey.current}`, {data: {judgeid: query.judgeId, index: e}}).then((_) => {})

                    }} id={index} deleteMessage={"Delete Evaluation"}/></td>
                  </tr>
                )) : <tr><td colSpan={10}>Please log in</td></tr>}
                {auth ? (
                  <tr>

                  <td colSpan={3} style={{width:"20%", background: "#0E397A", color: "white", fontWeight: "750"}}></td>

                  <td style={{width:"13%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*((judge?.evaluations.reduce((accum, current) => accum+(current.decision*current.weight), 0))||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"13%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*(judge?.evaluations.reduce((accum, current) => accum+(current.comparison*current.weight), 0)||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"13%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*(judge?.evaluations.reduce((accum, current) => accum+(current.citation*current.weight), 0)||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"13%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*(judge?.evaluations.reduce((accum, current) => accum+(current.coverage*current.weight), 0)||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"13%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*(judge?.evaluations.reduce((accum, current) => accum+(current.bias*current.weight), 0)||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"15%", background: "#0E397A", color: "white", fontWeight: "750"}}>{Math.round(100*(judge?.evaluations.reduce((accum, current) => accum+((current.decision+current.comparison+current.citation+current.coverage+current.bias)*current.weight), 0)||0)/(totalWeight(judge!)))/100}</td>
                  <td style={{width:"15%", background: "#0E397A", color: "white", fontWeight: "750"}}></td>

                  </tr>
                ) : ""}
                
                </tbody>
              </table>

              <span className={styles.label}>Create Evaluation</span>
              {auth ? <CreateForm callback={pushNewEvaluation} judge={judge || {_id: "", name: "", email: "", evaluations: []}}/> : <span className={styles.sublabel}>Login to create</span>}
            
            </div> : "Loading..."}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;