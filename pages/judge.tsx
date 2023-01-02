/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import axios from 'axios';
import { useRouter } from 'next/router';
import DeleteButton from '../components/buttons/DeleteButton';
import NavigationBar from '../components/nav/NavigationMenu';
import { LineGraph } from '../components/dataviews/LineGraph';
import { Evaluation } from '../types/Evaluation';
import { computeMean, Judge } from '../types/Judge';
import { CreateEvaluation } from '../components/create/CreateEvaluation';
import { computeMeanBias, computeMeanCoverage, computeMeanCitation, computeMeanComparison, computeMeanDecision } from '../types/Judge';

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

  const sumAll = (element: Evaluation) => (element.decision+element.comparison+element.citation+element.coverage+element.bias);

  const deleteButtonCallback = (e: number) => {
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

  }

  const rowCss = {background: "#0E397A", color: "white", fontWeight: "750"};

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
              <LineGraph data={data}/>

              <span className={styles.label}>Current Evaluations</span>

              {(judge?.evaluations.length||0) > 0 ? <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.one}>
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
                    <td style={{background: "#FEE499"}}>{sumAll(element)}</td>

                    <td style={{width: "10%"}}><DeleteButton callback={deleteButtonCallback} id={index} deleteMessage={"Delete Evaluation"}/></td>
                  </tr>
                )) : <tr><td colSpan={10}>Please log in</td></tr>}
                {auth ? (
                  <tr>

                  <td colSpan={3} style={rowCss}></td>

                  <td style={rowCss}>{Math.round(100*computeMeanDecision(judge!))/100}</td>
                  <td style={rowCss}>{Math.round(100*computeMeanComparison(judge!))/100}</td>
                  <td style={rowCss}>{Math.round(100*computeMeanCitation(judge!))/100}</td>
                  <td style={rowCss}>{Math.round(100*computeMeanCoverage(judge!))/100}</td>
                  <td style={rowCss}>{Math.round(100*computeMeanBias(judge!))/100}</td>
                  <td style={rowCss}>{Math.round(100*computeMean(judge!))/100}</td>
                  <td style={rowCss}></td>

                  </tr>
                ) : ""}
                
                </tbody>
              </table> : <span className={styles.label}>No Evaluations</span>}

              
              {auth ? <CreateEvaluation callback={pushNewEvaluation} judge={judge || {_id: "", name: "", email: "", evaluations: []}}/> : <span className={styles.sublabel}>Login to create</span>}
            
            </div> : "Loading..."}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;