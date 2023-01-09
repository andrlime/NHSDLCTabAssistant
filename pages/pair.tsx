/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import html2canvas from "html2canvas";
import NavigationBar from '../components/nav/NavigationMenu';
import Debate from '../types/Debate';
import { FlightTable } from '../components/dataviews/FlightTable';
import FileUpload from '../components/create/FileUpload';

const Home: NextPage = () => {
  const [stTime, setStTime] = useState(0);
  const [roundsA, setA] = useState<Array<Debate>>([]);
  const [roundsB, setB] = useState<Array<Debate>>([]);

  const [division, setDivision] = useState("");
  const [roundName, setRoundName] = useState("");

  let divisionDictionary = {"MSPF": "Middle School Division", "MSNPF": "Middle School Novice Division", "OPF": "Open Division", "NPF": "Novice Division", "JVPF": "Junior Varsity Division", "VPF": "Varsity Division"};
  let roundDictionary = {"R1": "Round 1", "R2": "Round 2", "R3": "Round 3", "R4": "Round 4", "R5": "Round 5", "R6": "Round 6", "TOF": "Triple Octofinals", "Triples": "Triple Octofinals", "DOF": "Double Octofinals", "Doubles": "Double Octofinals",
                         "OF": "Octofinals", "QF": "Quarterfinals", "SF": "Semifinals", "GF": "Grand Finals"};

  const FULL_LINE_REGEX = /.+/g; //matches all full lines
  const HEADER_RX = /[A-Z,a-z,0-9, ^,]+/g;
  const ROUND_RX = /[A-Za-z0-9 &-]+/g;
  const translate = (dictionary: {[key: string]: string}, searchTerm: string) => dictionary[searchTerm] || "MANUALLY CHANGE"; // lambda func
  //if you can't read this, get good
  const processInput = (input: string) => {
    /** Define two empty arrays to put rounds in later.
     * type Debate is a single round
     * flight: string;
     * teamA: string;
     * teamB: string;
     * roomCode: string;
     * judgeName: any;
     */
    let rA: Debate[] = [];
    let rB: Debate[] = [];

    // matches all full lines and stores them in an array. If this doesn't exist, return an empty array and stop.
    let lines: any[] = input.match(FULL_LINE_REGEX) || [];
    if(lines.length == 0) return;

    // heading line is the first line of the file, assuming it's not corrupted. rounds is the rest.
    const HEADING_LINE = lines[0];
    const ROUNDS_ARRAY = lines.splice(1);

    // heading elements is each thingy in the line separated by a comma. Really, this should be done with Array.split but i don't give enough shits.
    const HEADING_ELEMENTS = HEADING_LINE.match(HEADER_RX);
    // 组别 = zubie = first element of that array. 轮次 = lunci = third element of that array (cuz the second one is empty)
    let zubie = HEADING_ELEMENTS[0];
    let lunci = HEADING_ELEMENTS[2];
    // get the NUMBER of the round, or if that doesn't exist, 9 for ELIM rounds
    const ROUND_NO = (lunci.match(/\d+/g) || [])[0] || "9"; //9 is code for elims

    // set state based on this info
    setDivision(translate(divisionDictionary, zubie));
    setRoundName(translate(roundDictionary, lunci));

    // process each round
    for(let round of ROUNDS_ARRAY) {
      // round rx matches round information per round
      const ROUND_DATA = round.match(ROUND_RX);
      // round to push
      let roundx: Debate;
      // adjustment. if the round is power matched, so >2 >=3, add one due to there being a bucket column
      let adjustment: number = ROUND_NO <= 2 ? 0 : 1;
      
      // if bye, return a empty flight 1 bye round
      if(ROUND_DATA[0] == "BYE") {
        roundx = {
          flight: ROUND_DATA[1+adjustment] == "Flt1" ? "1" : "2",
          teamA: ROUND_DATA[2+adjustment],
          teamB: "",
          roomCode: "",
          judgeName: "BYE"
        }
      } else {
        // otherwise, return a round extracting round data from ROUND_DATA
        roundx = {
          flight: ROUND_DATA[1+adjustment] == "Flt1" ? "1" : "2",
          teamA: ROUND_DATA[2+adjustment],
          teamB: ROUND_DATA[4+adjustment],
          roomCode: ROUND_DATA[6+adjustment],
          judgeName: ROUND_DATA[7+adjustment] || "BYE"
        }
      }

      // if elims, set judge name to ALL JUDGE NAMES. First judge, who owns the room, gets a © for CHAIR
      if(ROUND_NO == "9") {
        // "if round data 14 exists this round has a panel of 5. RARELY will there be a panel of 7. if there is, well, I hope you're smart enough to write that in"
        if(ROUND_DATA[14]) {
          roundx.judgeName = (<span>{(String(ROUND_DATA[8])).trim()}&nbsp;<span style={{fontWeight: "600"}}>&#169;</span>, {ROUND_DATA[10]}, {ROUND_DATA[12]}, {ROUND_DATA[14]}, {ROUND_DATA[16]}</span>);
        } else {
          roundx.judgeName = (<span>{(String(ROUND_DATA[8])).trim()}&nbsp;<span style={{fontWeight: "600"}}>&#169;</span>, {ROUND_DATA[10]}, {ROUND_DATA[12]}</span>);
        }
      }

      // if the round is flight 1, push to rA, the flight 1 list. otherwise, push to flight 2
      if(roundx.flight == "1") {
        rA.push(roundx);
      } else {
        rB.push(roundx);
      }
    }

    // set state
    setA(rA);
    setB(rB);
  }

  const redColorHex = "#FF6961";
  const process = (value: number) => {
    let valueAsString = String(value);
    if(value < 1000) {
      return `${valueAsString.charAt(0)}:${valueAsString.substring(1)}`
    } else if (value < 2400) {
      return `${valueAsString.substring(0,2)}:${valueAsString.substring(2)}`
    }
  }

  const exportAsPicture = () => {
    if( stTime <= 0 || stTime >= 2400 || division.indexOf("MANUAL")!=-1 || roundName.indexOf("MANUAL")!=-1 ) {
      console.error("You need to fix errors before downloading this image.");
      return;
    }
    let data = document.getElementById('CONTAINER_TO_EXPORT')!
    html2canvas(data).then((canvas)=>{
      let image = canvas.toDataURL('image/png', 1.0);
      let fileName = `${division}-${roundName}.png`;
      saveAs(image, fileName)
    })
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

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools - Pairings Tool</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <NavigationBar pageIndex={0}/>
      <div className={styles.content}>
        <div className={styles.heading}>Generate Pairings</div>
        
        <div className={styles.form}>

          <div className={styles.label}>Upload the horizontal schematic for this round here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Pairings CSV:&nbsp;<FileUpload callback={processInput} typesToAllow={".csv"}/></div>
          </div>

          <div className={styles.label}>Make manual changes. If any are red, exporting will fail.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Division Name:&nbsp;<input style={{borderColor: division.indexOf("MANUAL")!=-1 ? redColorHex : "#0E397A"}} value={division} type={"text"} onChange={(e:any)=>(setDivision(e.target.value))}/></div>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Round Name:&nbsp;<input style={{borderColor: roundName.indexOf("MANUAL")!=-1 ? redColorHex : "#0E397A"}} value={roundName} type={"text"} onChange={(e:any)=>(setRoundName(e.target.value))}/></div>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Start Time:&nbsp;<input style={{borderColor: !stTime || (stTime<0 || stTime > 2400) ? redColorHex : "#0E397A"}} value={stTime} type={"number"} onChange={(e:any)=>(setStTime(e.target.value))}/></div>
          </div>

          <div className={styles.label}>Export as an image, and release to judges and debaters. Please use a laptop for this.</div>
          <div className={styles.sublabel}>
          <button onClick={exportAsPicture}>Export to Image</button>
          </div>

          <div className={stylesQ.tables} id="CONTAINER_TO_EXPORT">
            
            <div className={stylesQ.headers}>

              <div className={stylesQ.divisionName}>{division}</div>
              <div className={stylesQ.roundName}>{roundName}</div>

            </div>

            {roundsA.length > 0 ? (<div className={stylesQ.boxA}>
            <div className={stylesQ.timeLabel}><span>Flight 1</span> <span>Starts at {process(stTime)}</span></div>
            <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.one}>
              <tr style={{height: "1rem"}}><td style={{width:"10%"}}>Flight</td><td style={{width:"20%"}}>Team</td><td style={{width:"20%"}}>Team</td><td style={{width:"25%"}}>Meeting ID</td><td style={{width:"25%"}}>Judges</td></tr>
              <FlightTable rounds={roundsA}/>
            </table></div>) : ""}

            {roundsB.length > 0 ? (<div className={stylesQ.boxA}>
            <div className={stylesQ.timeLabel}><span>Flight 2</span> <span>Starts at {process(parseInt(String(stTime))+100)}</span></div>
            <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.two}>
              <tr style={{height: "1rem"}}><td style={{width:"10%"}}>Flight</td><td style={{width:"20%"}}>Team</td><td style={{width:"20%"}}>Team</td><td style={{width:"25%"}}>Meeting ID</td><td style={{width:"25%"}}>Judges</td></tr>
              <FlightTable rounds={roundsB}/>
            </table></div>) : ""}

            <div className={stylesQ.footer}>

              <img alt={"Logo"} src={"/logo.png"}/>

            </div>
          </div>

        </div>
        
        
      </div>
    </div>
  );
};

export default Home;