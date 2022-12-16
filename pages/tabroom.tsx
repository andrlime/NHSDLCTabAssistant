/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { FunctionComponent,  useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import type { Tool, Team, Speaker } from './typedeclarations';
import html2canvas from "html2canvas";

const BreakTable: FunctionComponent<{teams: Array<Team>, division: string, topx: number}> = ({teams, division, topx}) => {
  return (
    <>
      {(teams.filter(e => e.division==division)).slice(0,topx).map((item, index) => (
        <tr key={index} style={{height: "1rem"}}>
          <td style={{width:"10%"}}>{index+1}</td><td style={{width:"10%"}}>{item.id}</td><td style={{width:"40%"}}>{item.speaker1.name_cn} - {item.speaker1.school}</td><td style={{width:"40%"}}>{item.speaker2.name_cn} - {item.speaker2.school}</td>
        </tr>
      ))}
    </>
  )
}

const SpeakerTable: FunctionComponent<{speakers: Array<Speaker>, division: string, topx: number}> = ({speakers, division, topx}) => {
  return (
    <>
      {(speakers.filter(e => e.division==division)).slice(0,topx).map((item, index) => (
        <tr key={index} style={{height: "1rem"}}>
          <td style={{width:"10%"}}>{index+1}</td><td style={{width:"10%"}}>{item.id}</td><td style={{width:"40%"}}>{item.name_cn}</td><td style={{width:"40%"}}>{item.school}</td>
        </tr>
      ))}
    </>
  )
}

const toolbox: Tool[] = [
  {id: 1, name: "Pairings Generator", description: "Generate pairings image from horizontal schematic", link: "/pair", active: false},
  {id: 2, name: "Results Image Generator", description: "Generator results as an image", link: "/results", active: true},
  {id: 3, name: "Results Spreadsheet Generator", description: "Generate results for a given division as a csv file", link: "/resultscsv", active: false},
  {id: 10, name: "Tabroom Import Spreadsheet Convertor", description: "Convert DLC namelist to Tabroom format spreadsheet", link: "/tabroom", active: false},
];

const Home: NextPage = () => {
  const [burger, setBurger] = useState(true);

  const readFile = async (file: any) => {
    if (!file) return
    const data = await file.text()
    return data;
  }
  
  const handleOnSubmit = (e: any) => {
      e.preventDefault();
      if (nlFile) {
        readFile(nlFile).then((e) => {
          setNamelist(e);
        }
        );
      }
  };

  const navBar = (<div className={styles.navbar}>
    <div className={burger ? styles.burger : styles.cross} onClick={_ => setBurger(!burger)}><span></span><span></span><span></span></div>
    <div style={{padding: "1rem", color: "#0E397A"}}/>
    {!burger ? (<div>
      {toolbox.map((item, index) => (
        <Link href={item.link}><div className={styles.menuLabel} style={{backgroundColor: item.active ? "#ECC132" : "", color: item.active ? "black" : ""}}>{item.name}</div></Link>
      ))}
    </div>) : ""}
  </div>);

  const [nlFile, setNLFile] = useState();
  const [namelist, setNamelist] = useState("");
  const processInput = (input: string): Array<{name: string, data: string}> => {
    //TODO: add labels from the spreadsheet
    /**
     * 100-400 Middle School
     * 500-700 Open
     * 800+ Varsity
     * 
     * combinations
     * speaker awards
     * break list
     */
    console.log("Reading student namelist")
    let allStudents = (input.slice(input.indexOf("1,")));
    const rx_by_division = /[A-Z][a-zA-Z]+,{5,}/g;
    const full_line_rx = /.+/g; //matches all full lines
    let divisions = (allStudents.match(rx_by_division));
    let divisionIndexes = [0].concat(divisions?.map(e => allStudents.indexOf(e)) || []);
    let strings_to_test: string[] = [];
    for(let aa = 0; aa < divisionIndexes.length-1; aa ++) {
      strings_to_test.push(allStudents.substring(divisionIndexes[aa], divisionIndexes[aa+1]));
    }

    let outputs: Array<{name: string, data: string}> = [];
    for(let testing_string of strings_to_test) {
      let allSpeakersList: Array<Speaker> = [];
      let allTeamsList: Array<Team> = [];
      let division = (testing_string.match(/[A-Za-z]+/g) || [])[0]; // need to write this
      let outputstr = "School Name, State/Prov, Entry Code,Pairing Seed (1-100), Speaker 1 First,Speaker 1 Middle,Speaker 1 Last,Speaker 1 Novice (Y/N),Speaker 1 Gender (F/M/O),Speaker 1 Email,Speaker 2 First,Speaker 2 Middle,Speaker 2 Last,Speaker 2 Novice (Y/N),Speaker 2 Gender (F/M/O),Speaker 2 Email,Speaker 3 First,Speaker 3 Middle,Speaker 3 Last,Speaker 3 Novice (Y/N),Speaker 3 Gender (F/M/O),Speaker 3 Email\n"; // need to write this
      let listOfAllStrings = (testing_string.match(full_line_rx)) || [];
      for(let ind in listOfAllStrings) {
        let k = listOfAllStrings[ind];
        if(k.match(rx_by_division) || k.indexOf(",,,,,,,,,,,,") != -1) continue;
        let speakerInfo = k.split(',');
        let speakerX: Speaker = {
          division: speakerInfo[1],
          id: parseInt(speakerInfo[3]) || 0,
          teamid: parseInt(speakerInfo[2]) || 0,
          name_cn: speakerInfo[4],
          name_en: speakerInfo[5],
          school: speakerInfo[13]
        }
        allSpeakersList.push(speakerX);
      }

      // process them into teams. they are in order, so index by 2
      for(let indexVariable = 0; indexVariable < allSpeakersList.length; indexVariable+=2) {
        let [speakerOne, speakerTwo] = [allSpeakersList[indexVariable], allSpeakersList[indexVariable+1]]
        if(speakerOne.teamid!=speakerTwo.teamid) console.log("???")
        let teamX: Team = {
          division: speakerOne.id < 300 ? "Middle School" : speakerOne.id < 500 ? "Novice" : speakerOne.id < 800 ? "Open" : "Varsity",
          id: speakerOne.teamid,
          speaker1: speakerOne,
          speaker2: speakerTwo
        }
        allTeamsList.push(teamX);
      }

      // now, iterate through all teams from that test string to create entries
      for(let team of allTeamsList) {
        //let outputstr = "School Name, State/Prov, Entry Code,Pairing Seed (1-100), Speaker 1 First,Speaker 1 Middle,Speaker 1 Last,Speaker 1 Novice (Y/N),Speaker 1 Gender (F/M/O),Speaker 1 Email,Speaker 2 First,Speaker 2 Middle,Speaker 2 Last,Speaker 2 Novice (Y/N),Speaker 2 Gender (F/M/O),Speaker 2 Email,Speaker 3 First,Speaker 3 Middle,Speaker 3 Last,Speaker 3 Novice (Y/N),Speaker 3 Gender (F/M/O),Speaker 3 Email\n"; // need to write this
        let school_name = team.speaker1.school == team.speaker2.school ? team.speaker1.school : `H - ${team.speaker1.school} / ${team.speaker2.school}`;
       outputstr += `${school_name},,${team.id},,${team.speaker1.name_en},,${team.speaker1.id},N,O,,${team.speaker2.name_en},,${team.speaker2.id},N,O,,,,,,,,\n`
      }

      outputs.push({name: division || "", data: outputstr});
    }

    return outputs;
  }

  const exportAsCsv = () => {
    let data = processInput(namelist);
    for(let s of data) {
      console.log(s);
      let d = 'data:text/csv;charset=utf-8,' + encodeURI(s.data);
      let fileName = `${s.name}_EntriesList.csv`;
      saveAs(d, fileName);
    }
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

  const redColorHex = "#FF6961";

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools - Rankings</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      {navBar}
      <div className={styles.content}>
        <div className={styles.heading}>Convert NHSDLC Namelist to Tabroom Import CSV</div>
        
        <div className={styles.form}>

          <div className={styles.label}>Upload the NHSDLC <em>STUDENT NAMELIST SPREADSHEET</em> from Tencent Docs as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Student Namelist CSV:&nbsp;<input onChange={(e: any) => setNLFile(e.target.files[0])} type={"file"} id={"csvFileInput"} accept={".csv"}/></div>
            <button style={{border: namelist ? `1px solid #ECC132` : `1px solid ${redColorHex}`}} onClick={(e: any) => {handleOnSubmit(e)}}>Upload Namelist CSV</button>
          </div>

          <div className={styles.label}>Export as multiple CSVs (please allow your browser to download multiple files).</div>
          <div className={styles.sublabel}>
          <button onClick={exportAsCsv}>Export to CSV</button>
          </div>

          <div className={styles.label}>For judges, just do it yourself. It should be really quick.</div>

        </div>
        
        
      </div>
    </div>
  );
};

export default Home;