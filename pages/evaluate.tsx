/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import axios from 'axios';
import { computeStdev, computeMean, computeZ, Judge } from '../types/Judge';
import NavigationBar from '../components/nav/NavigationMenu';
import DeleteButton from '../components/buttons/DeleteButton';
import { CreateJudge } from '../components/create/CreateJudge';

const Home: NextPage = () => {
  const [judges, setJudges] = useState<Array<Judge>>([]);
  const [error, setError] = useState("Loading...");
  const [hasError, setHasError] = useState(false);

  const [sortColumn, setSortColumn] = useState(0);
  const [isAscending, setIsAsc] = useState(false);

  const [filter, setFilter] = useState("");

  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [gotPwWrong, setGotPwWrong] = useState(false);

  const backendUrl = useRef("");
  const apiKey = useRef("");

  useEffect(() => {
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

      let userpass = `U1A${localStorage.us}P28${localStorage.pw}`;
    
      axios.get(`https://${backendUrl.current}/auth/${userpass}`).then((res) => {
        if(res.data.auth) {
          setAuth(true);
        } else {
          setGotPwWrong(true);
        }
      });
    })
  },[]);

  const sortTable = (sortColumnIndex: number, sortFunction: Function, array?: any[]) => {
    if(!array) {
      setSortColumn(sortColumnIndex);
      setIsAsc(!isAscending);
      let sortedList = judges.sort((a,b) => (sortFunction(a)-sortFunction(b)) * multiplierAsc);
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

  const addALotCallback = (J: Judge[]) => {
    let j = judges.filter((_) => true);
    for(let ju of J) {
      j.push(ju);
      let body = {
        apikey: apiKey.current,
        name: ju.name,
        email: ju.email
      };
      axios.post(`https://${backendUrl.current}/create/judge`, body).then((_) => {})
    }
    setJudges(j);
  }

  const ascSymb = isAscending ? <>&uarr;</> : <>&darr;</>;
  let multiplierAsc = (isAscending ? 1 : -1);
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
            
            {auth ? <span>Logged in</span> : (<><input placeholder='username' value={username} onChange={(e)=>setUser(e.target.value)} type={'text'} style={{border: gotPwWrong ? `2px solid red` : "",width: "25%", minWidth: "200px", padding: "0.2rem", margin: "0.25rem"}}></input>
            <input placeholder='password' value={password} onChange={(e)=>setPass(e.target.value)} type={'password'} style={{border: gotPwWrong ? `2px solid red` : "", width: "25%", minWidth: "200px", padding: "0.2rem", margin: "0.25rem"}}></input></>)}
            
            {auth ? "" : <button onClick={(e) => {
              let userpass = `U1A${username}P28${password}`;
              axios.get(`https://${backendUrl.current}/auth/${userpass}`).then((res) => {
                if(res.data.auth) {
                  setAuth(true);
                  localStorage.setItem('us', username);
                  localStorage.setItem('pw', password);
                } else {
                  setGotPwWrong(true);
                }
              })
            }}>Login</button>}

          </div>

          <div className={stylesQ.tables} style={{width: "50%"}}>
          {!hasError ? (<table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.one}>
            <tbody>
            <tr style={{height: "1rem"}}>
              <td style={{width:"10%"}} onClick={(_)=>sortTable(1, (_: any)=>{}, judges.sort((a,b) => a.name.localeCompare(b.name) * multiplierAsc))}>Judge Name <span>{sortColumn == 1 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"15%"}}>Email</td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(3, computeMean)}>Average Rating <span>{sortColumn == 3 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={(_) => sortTable(4, computeStdev)}>Stdev of Rating <span>{sortColumn == 4 ? ascSymb : <>&#124;</>}</span></td>
              <td colSpan={2} style={{width:"20%"}} onClick={(_) => sortTable(5, computeZ)}>Z-Score of Rating <span>{sortColumn == 5 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{backgroundColor: "#b81818"}}>Delete</td>
            </tr>

            {auth ? (judges.filter(element => element.email.toLowerCase().includes(filter) || element.name.toLowerCase().includes(filter))).map(element=>(
              <tr key={element._id.toString()}>
                <td>{element.name}</td>
                <td>{element.email}</td>
                <td>{Math.round( 1000 * computeMean(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeStdev(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeZ(element, judges) )/1000}</td>
                <Link href={element._id!="REFRESH TO SEE" ? `/judge?judgeId=${element._id}&user=${username}&pass=${password}` : ''} as={'/judge'}><td id={styles.customrow} style={{width: "10%", padding: "0.3rem"}}>&rarr;</td></Link>
                <td style={{width: "10%"}}><DeleteButton callback={deleteButtonCallback} id={element._id.toString()} deleteMessage={"Delete Judge"}/></td>
              </tr>
            )) : <tr><td colSpan={7}>Please log in</td></tr>}
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