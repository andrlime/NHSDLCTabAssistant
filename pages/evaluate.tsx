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

const toolbox: Tool[] = [
  {id: 1, name: "Pairings Generator", description: "Generate pairings image from horizontal schematic", link: "/pair", active: false},
  {id: 2, name: "Results Image Generator", description: "Generator results as an image", link: "/results", active: false},
  {id: 3, name: "Results Spreadsheet Generator", description: "Generate results for a given division as a csv file", link: "/resultscsv", active: false},
  {id: 10, name: "Tabroom Import Spreadsheet Convertor", description: "Convert DLC namelist to Tabroom format spreadsheet", link: "/tabroom", active: false},
  {id: 99, name: "Evaluate Judges", description: "Judge evaluation system", link: "/evaluate", active: true},
];

type Judge = {
  _id: ObjectId | string,
  name: string,
  email: string,
  evaluations: Evaluation[],
  totalEarnedPoints: number,
  totalPossiblePoints: number
}

type Evaluation = {
  tournamentName: string,
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

const CreateJudge: FunctionComponent<{callback: Function, addALot: Function}> = ({callback, addALot}) => {
  const [judgeName, setJudgeName] = useState("");
  const [judgeEmail, setJudgeEmail] = useState("");
  const backendUrl = useRef("");
  const apiKey = useRef("");

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
          axios.post(`http://${backendUrl.current}/create/judge`, body).then((res) => {
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

      <FileUploadArea addJudge={(listOfJudgesToAdd: Judge[]) => {
        addALot(listOfJudgesToAdd);
      }}/>
    </div>

  </div>);
}

const DeleteButton: FunctionComponent<{callback: Function, id: string}> = ({callback, id}) => {
  const [confirm, setConfirm] = useState(false);
  return (<div className={styles.deleteElement}>

    <button onClick={(e) => {
      if (confirm) {
        callback(id);
      } else {
        setConfirm(true);
      }
    }} style={{padding: "0.2rem"}}>{confirm ? "Confirm?" : "Delete Judge"}</button>

  </div>);
}

const FileUploadArea: FunctionComponent<{addJudge: Function}> = ({addJudge}) => {
  const [file, setFile] = useState();

  const processFile = (input: any) => {
    setFile(input);
    handleOnSubmit(input);
  }

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

      allJudgesArray.push({_id: "REFRESH TO SEE", name: name, email: email, evaluations: [], totalEarnedPoints: 0, totalPossiblePoints: 0});
    }
    addJudge(allJudgesArray);
  }

  const readFile = async (file: any) => {
    if (!file) return;
    const data = await file.text();
    return data;
  }

  const handleOnSubmit = (input: any) => {
      readFile(input).then((e) => {
          processInput(e);
        }
      );
  };

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
    <div>Upload Judges from File: <input onChange={(e: any) => processFile(e.target.files[0])} accept={".csv"} type={'file'}></input></div>
    <div>Download Template: <button onClick={(_) => downloadSample()}>Download</button></div>
  </div>)
}

const Home: NextPage = () => {
  const [burger, setBurger] = useState(true);

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

  const navBar = (<div className={styles.navbar}>
    <div className={burger ? styles.burger : styles.cross} onClick={_ => setBurger(!burger)}><span></span><span></span><span></span></div>
    <div style={{padding: "1rem", color: "#0E397A"}}/>
    {!burger ? (<div>
      {toolbox.map(item => (
        <Link key={item.id**5.1} href={item.link}><div className={styles.menuLabel} style={{backgroundColor: item.active ? "#ECC132" : "", color: item.active ? "black" : ""}}>{item.name}</div></Link>
      ))}
    </div>) : ""}
  </div>);

  const backendUrl = useRef("");
  const apiKey = useRef("");

  useEffect(() => {
    axios.get("/api/getkey").then((res)=> {
      backendUrl.current = res.data.backendUrl || "localhost:9093";
      apiKey.current = res.data.apiKey || "";
      // replace later
      axios.get(`http://${backendUrl.current}/get/alljudges/${apiKey.current}`).then((res) => {
        if(res.data != null) {
          setJudges(res.data.result);
        }
      }).catch(err => {
        setError(err);
        setHasError(true);
      }); 

      let userpass = `U1A${localStorage.us}P28${localStorage.pw}`;
    
      axios.get(`http://${backendUrl.current}/auth/${userpass}`).then((res) => {
        if(res.data.auth) {
          setAuth(true);
        } else {
          setGotPwWrong(true);
        }
      });
    })
  },[]);

  const computeStdev = (judge: Judge): number => {
    const partialList = [];
    for(const i of judge.evaluations) {
        partialList.push(i.bias+i.citation+i.comparison+i.coverage+i.decision);
    }

    // compute stdev of that list
    const sumOfList = partialList.reduce((accum, current) => accum+current, 0);
    const mean = sumOfList/partialList.length;

    const sumOfVariances = partialList.reduce((accum, current) => accum+((current-mean)**2), 0);
    return (sumOfVariances/(partialList.length-1))**(0.5);
  }

  const computeZ = (judge: Judge): number => {
    // total weighted score of all judges and stdev
    let wsum = 0;
    let wtotal = 0;
    let numberOfEvaluations = 0;
    for(let j of judges) {
      for(let ev of j.evaluations) {
        wsum+=(ev.bias+ev.citation+ev.comparison+ev.coverage+ev.decision)*ev.weight;
        wtotal+=ev.weight;
        numberOfEvaluations++;
      }
    }

    const W_AVG_ALLJUDGES = wsum/wtotal;

    //// stdev, all judges
    let variance = judges.reduce((accum, current) => accum+current.evaluations.reduce((a, c) => a+((c.bias+c.citation+c.comparison+c.coverage+c.decision-W_AVG_ALLJUDGES)**2), 0), 0)
    const SD_ALLJUDGES = (variance/numberOfEvaluations)**0.5;

    // total weighted score of just this judge and stdev
    wsum = 0;
    wtotal = 0;
    numberOfEvaluations = 0;
    for(let ev of judge.evaluations) {
      wsum+=(ev.bias+ev.citation+ev.comparison+ev.coverage+ev.decision)*ev.weight;
      wtotal+=ev.weight;
      numberOfEvaluations++;
    }
    const W_AVG_JUST_THIS_JUDGE = wsum/wtotal;
    
    variance = judge.evaluations.reduce((a, c) => a+((c.bias+c.citation+c.comparison+c.coverage+c.decision-W_AVG_ALLJUDGES)**2), 0);
    const SD_JUST_THIS_JUDGE = (variance/numberOfEvaluations)**0.5;

    // if you can read all of that without blinking, you deserve a raise
    // find the z score
    let z = (W_AVG_ALLJUDGES-W_AVG_JUST_THIS_JUDGE)/((((SD_ALLJUDGES**2)/(judges.length)) + ((SD_JUST_THIS_JUDGE**2)/(judge.evaluations.length)))**(0.5));
    return -1*z;
  }

  const ascSymb = isAscending ? <>&uarr;</> : <>&darr;</>;
  let multiplierAsc = (isAscending ? 1 : -1);

  const computeMean = (j: Judge): number => {
    let wsum = 0;
    let wtotal = 0;

    for(let ev of j.evaluations) {
      wsum+=(ev.bias+ev.citation+ev.comparison+ev.coverage+ev.decision)*ev.weight;
      wtotal+=ev.weight;
    }

    return wsum/wtotal
  }

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Judge Evaluation System</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      {navBar}
      <div className={styles.content}>
        <div className={styles.heading}>Judge Evaluation System: Viewing All Judges</div>
        <div className={styles.form} style={{paddingLeft: "0rem", width: "100%"}}>

          <div className={styles.sublabel} style={{paddingLeft: "0.5rem", display: "flex", width: "100%"}} id={styles.customlabel}>
            <input placeholder='filter judges by name or email' value={filter} onChange={(e)=>setFilter(e.target.value)} type={'text'} style={{width: "70%", minWidth: "450px", padding: "0.2rem", margin: "0.25rem"}}></input>
            
            {auth ? <span>Logged in</span> : (<><input placeholder='username' value={username} onChange={(e)=>setUser(e.target.value)} type={'text'} style={{border: gotPwWrong ? `2px solid red` : "",width: "25%", minWidth: "200px", padding: "0.2rem", margin: "0.25rem"}}></input>
            <input placeholder='password' value={password} onChange={(e)=>setPass(e.target.value)} type={'password'} style={{border: gotPwWrong ? `2px solid red` : "", width: "25%", minWidth: "200px", padding: "0.2rem", margin: "0.25rem"}}></input></>)}
            {auth ? "" : <button onClick={(e) => {
              let userpass = `U1A${username}P28${password}`;
              axios.get(`http://${backendUrl.current}/auth/${userpass}`).then((res) => {
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
              <td style={{width:"15%"}}>Judge ID</td>
              <td style={{width:"10%"}} onClick={e=>{
                setSortColumn(1);
                setIsAsc(!isAscending);
                let sortedList = judges.sort((a,b) => a.name.localeCompare(b.name) * multiplierAsc);
                setJudges(sortedList);
              }}>Judge Name <span>{sortColumn == 1 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"15%"}}>Email</td>
              <td style={{width:"20%"}} onClick={e=>{
                setSortColumn(3);
                setIsAsc(!isAscending);
                let sortedList = judges.sort((a,b) => (computeMean(a)-computeMean(b)) * multiplierAsc);
                setJudges(sortedList);
              }}>Average Rating <span>{sortColumn == 3 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{width:"20%"}} onClick={e=>{
                setSortColumn(4);
                setIsAsc(!isAscending);
                let sortedList = judges.sort((a,b) => (computeStdev(a)-computeStdev(b)) * multiplierAsc);
                setJudges(sortedList);
              }}>Stdev of Rating <span>{sortColumn == 4 ? ascSymb : <>&#124;</>}</span></td>
              <td colSpan={2} style={{width:"20%"}} onClick={e=>{
                setSortColumn(5);
                setIsAsc(!isAscending);
                let sortedList = judges.sort((a,b) => (computeZ(a)-computeZ(b)) * multiplierAsc);
                setJudges(sortedList);
              }}>Z-Score of Rating <span>{sortColumn == 5 ? ascSymb : <>&#124;</>}</span></td>
              <td style={{backgroundColor: "#b81818"}}>Delete</td>
            </tr>
            {auth ? (judges.filter(element => element.email.toLowerCase().includes(filter) || element.name.toLowerCase().includes(filter))).map(element=>(
              <tr key={element._id.toString()}>
                <td>{element._id.toString()}</td>
                <td>{element.name}</td>
                <td>{element.email}</td>
                <td>{Math.round( 1000 * computeMean(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeStdev(element) ) / 1000}</td>
                <td>{Math.round( 1000 * computeZ(element) )/1000}</td>
                <Link href={element._id!="REFRESH TO SEE" ? `/judge?judgeId=${element._id}&user=${username}&pass=${password}` : ''} as={'/judge'}><td id={styles.customrow} style={{width: "10%", padding: "0.3rem"}}>&rarr;</td></Link>
                <td style={{width: "10%"}}><DeleteButton callback={(e: string) => {
                  setJudges(judges.filter((a) => a._id.toString()!=e));
                  // call API route to delete the judge from the database
                  axios.delete(`http://${backendUrl.current}/delete/judge/${apiKey.current}`, {data: {judgeid: element._id.toString()}}).then((_) => {})

                }} id={element._id.toString()}/></td>
              </tr>
            )) : <tr><td colSpan={8}>Please log in</td></tr>}
            </tbody>
          </table>) : error}

          {auth ? <CreateJudge callback={(judge: Judge) => {
            let j = judges.filter((_) => true);
            j.push(judge);
            setJudges(j);
          }} addALot={(J: Judge[]) => {
            let j = judges.filter((_) => true);
            for(let ju of J) {
              j.push(ju);
              let body = {
                apikey: apiKey.current,
                name: ju.name,
                email: ju.email
              };
              axios.post(`http://${backendUrl.current}/create/judge`, body).then((_) => {})
            }
            setJudges(j);
          }}/> : ""}

        </div>
        </div>
      </div>
    </div>
  );
};

export default Home;