/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import axios from 'axios';
import { computeStdev, computeMean, computeZ, Judge, computeMeanDecision, computeMeanComparison, computeMeanCitation, computeMeanCoverage, computeMeanBias } from '../types/Judge';
import NavigationBar from '../components/nav/NavigationMenu';
import DeleteButton from '../components/buttons/DeleteButton';
import { CreateJudge } from '../components/create/CreateJudge';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const [judges, setJudges] = useState<Array<Judge>>([]);
  const [error, setError] = useState("Loading...");
  const [hasError, setHasError] = useState(false);

  const [sortColumn, setSortColumn] = useState(0); // not really index but more of just a number
  const [isAscending, setIsAsc] = useState(false);

  const [filter, setFilter] = useState("");

  const [auth, setAuth] = useState(false);

  const backendUrl = useRef("");
  const apiKey = useRef("");
  const router = useRouter();

  useEffect(() => {
    console.log(query, localStorage);

    if(query.auth == 'true') {
      setAuth(true);
    } else {
      setAuth(false);
      router.push(`/auth`);
    }

    axios.get("/api/getkey").then((res)=> {
      backendUrl.current = res.data.backendUrl || "localhost:9093";
      apiKey.current = res.data.apiKey || "";
      // replace later
      axios.get(`https://${backendUrl.current}/get/alljudges/${apiKey.current}`).then((res) => {
        if(res.data != null) {
          setJudges(res.data.result);
        }
      }).catch(err => {
        setError(err);
        setHasError(true);
      }); 
    })
  },[]);

  const sortTable = (sortColumnIndex: number, sortFunction: Function, array?: any[]) => {
    if(!array) {
      setSortColumn(sortColumnIndex);
      setIsAsc(!isAscending);
      let sortedList = judges.sort((a,b) => (sortFunction(a, judges)-sortFunction(b, judges)) * multiplierAsc);
      setJudges(sortedList);
    } else {
      setSortColumn(sortColumnIndex);
      setIsAsc(!isAscending);
      setJudges(array);
    }
  }
  
  const deleteButtonCallback = (e: string) => {
    setJudges(judges.filter((a) => a._id.toString()!=e));
    // call API route to delete the judge from the database
    axios.delete(`https://${backendUrl.current}/delete/judge/${apiKey.current}`, {data: {judgeid: e}}).then((_) => {})
  }

  const addOneJudgeCallback = (judge: Judge) => {
    let j = judges.filter((_) => true);
    j.push(judge);
    setJudges(j);
  }

  const addALotCallback = async (J: Judge[]) => {
    const add = async () => {
      let thingsToAdd = [];
      for(let ju of J) {
        let body = {
          apikey: apiKey.current,
          name: ju.name,
          email: ju.email
        };
        let result = await axios.post(`https://${backendUrl.current}/create/judge`, body)

        thingsToAdd.push({_id: result.data.result.insertedId,
                          name: ju.name,
                          email: ju.email,
                          evaluations: []})
      }

      let j = judges.filter((_) => true);
      for(let jud of thingsToAdd) {
        j.push(jud);
      }
      setJudges(j);
    }

    add();
  }

  const ascSymb = isAscending ? <>&uarr;</> : <>&darr;</>;
  let multiplierAsc = (isAscending ? 1 : -1);
  const { query } = useRouter();

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Judge Evaluation System</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <NavigationBar pageIndex={4}/>
      <div className={styles.content}>
        <div className={styles.heading}>Judge Evaluation System: Viewing All Judges</div>
        <div className={styles.form} style={{paddingLeft: "0rem", width: "100%"}}>

          <div className={styles.sublabel} style={{paddingLeft: "0.5rem", display: "flex", width: "100%"}} id={styles.customlabel}>
            <input placeholder='filter judges by name or email' value={filter} onChange={(e)=>setFilter(e.target.value)} type={'text'} style={{width: "70%", minWidth: "450px", padding: "0.2rem", margin: "0.25rem"}}></input>

          </div>

          <div className={stylesQ.tables} style={{width: "50%"}}>
          {!hasError ? (<table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.one}>
            <tbody>
            <tr style={{height: "1rem"}}>
              <td style={{width:"10%"}} onClick={(_)=>sortTable(1, (_: any)=>{}, judges.sort((a,b) => a.name.localeCompare(b.name) * multiplierAsc))}>Judge Name <span>{sortColumn == 1 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"15%"}}>Email</td>

              <td style={{width:"20%"}} onClick={(_) => sortTable(11, computeMeanDecision)}>Decision Rating <span>{sortColumn == 11 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(12, computeMeanComparison)}>Comparison Rating <span>{sortColumn == 12 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(13, computeMeanCitation)}>Citation Rating <span>{sortColumn == 13 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(14, computeMeanCoverage)}>Coverage Rating <span>{sortColumn == 14 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(15, computeMeanBias)}>Bias Rating <span>{sortColumn == 15 ? ascSymb : <>&#124;</>}</span></td>

              <td style={{width:"20%"}} onClick={(_) => sortTable(3, computeMean)}>Average <span>{sortColumn == 3 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(4, computeStdev)}>Stdev <span>{sortColumn == 4 ? ascSymb : <>&#124;</>}</span></td>
              <td colSpan={2} style={{width:"20%"}} onClick={(_) => sortTable(5, computeZ)}>Z-Score <span>{sortColumn == 5 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{backgroundColor: "#b81818"}}>Delete</td>
            </tr>

            {auth ? (judges.filter(element => element.email.toLowerCase().includes(filter) || element.name.toLowerCase().includes(filter))).map(element=>(
              <tr key={element._id.toString()}>
                <td>{element.name}</td>
                <td>{element.email}</td>

                <td>{Math.round( 1000 * computeMeanDecision(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeMeanComparison(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeMeanCitation(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeMeanCoverage(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeMeanBias(element) ) / 1000}</td>

                <td>{Math.round( 1000 * computeMean(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeStdev(element) ) / 1000 || "0"}</td>
                <td>{Math.round( 1000 * computeZ(element, judges) )/1000}</td>
                <Link href={element._id!="REFRESH TO SEE" ? `/judge?judgeId=${element._id}&auth=true` : ''} as={element._id!="REFRESH TO SEE" ? `/judge` : ''}><td id={styles.customrow} style={{width: "10%", padding: "0.3rem"}}>&rarr;</td></Link>
                <td style={{width: "10%"}}><DeleteButton callback={deleteButtonCallback} id={element._id.toString()} deleteMessage={"Delete Judge"}/></td>
              </tr>
            )) : <tr><td colSpan={12}>Please log in</td></tr>}
            </tbody>
          </table>) : error}

          {auth ? <CreateJudge callback={addOneJudgeCallback} addALot={addALotCallback}/> : ""}

        </div>
        </div>
      </div>
    </div>
  );
};

export default Home;