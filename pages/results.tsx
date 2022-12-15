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
  {id: 9, name: "Tabroom Import Spreadsheet Convertor", description: "Convert DLC namelist to Tabroom format spreadsheet", link: "/tabroom", active: false},
];

const Home: NextPage = () => {
  const [burger, setBurger] = useState(true);

  const navBar = (<div className={styles.navbar}>
    <div className={burger ? styles.burger : styles.cross} onClick={_ => setBurger(!burger)}><span></span><span></span><span></span></div>
    <div style={{padding: "1rem", color: "#0E397A"}}/>
    {!burger ? (<div>
      {toolbox.map((item, index) => (
        <Link href={item.link}><div className={styles.menuLabel} style={{backgroundColor: item.active ? "#ECC132" : "", color: item.active ? "black" : ""}}>{item.name}</div></Link>
      ))}
    </div>) : ""}
  </div>);

  const [fileOne, setFile1] = useState();
  const [fileTwo, setFile2] = useState();
  const [fileThree, setFile3] = useState();

  const [loadedOne, setLoadedOne] = useState(false);
  const [loadedTwo, setLoadedTwo] = useState(false);
  const [loadedThree, setLoadedThree] = useState(false);

  const readFile = async (file: any) => {
    if (!file) return
    const data = await file.text()
    return data;
  }

  const handleOnSubmit = (e: any, fileVariable: any, number: number) => {
      e.preventDefault();
      if (fileVariable) {
        readFile(fileVariable).then((e) => {
          processInput(e, number);
        }
        );
      }
  };

  //pairings state
  const [typeOfAward, setAwardType] = useState(""); // e.g. Top Speakers
  const [division, setDivision] = useState(""); // e.g. Middle School

  const getItOut = (list: Array<Speaker | Team>, key: string) => {
    for(let thingy of list) {
      if((thingy.id + "") == key) {
        return thingy;
      }
    }
  }

  const [speakers, setSpeakers] = useState<Array<Speaker>>([]);
  const [teams, setTeams] = useState<Array<Team>>([]);

  const [speakersInOrder, setSpeakersIO] = useState<Array<Speaker>>([]);
  const [teamsInOrder, setTeamsIO] = useState<Array<Team>>([]);
  const [isShowBreaks, setIsShowBreaks] = useState(false); // if true, show a break table, otherwise, show a speakers table
  const processInput = (input: string, type: number) => {
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
    if (type==1) {
      console.log("Reading student namelist")
      let allStudents = (input.slice(input.indexOf("1,")));
      const rx_by_division = /[A-Z][a-zA-Z]+[,]{5,}/g;
      const full_line_rx = /.+/g; //matches all full lines
      let divisions = (allStudents.match(rx_by_division));
      let divisionIndexes = [0].concat(divisions?.map(e => allStudents.indexOf(e)) || []);
      let strings_to_test: string[] = [];
      for(let aa = 0; aa < divisionIndexes.length-1; aa ++) {
        strings_to_test.push(allStudents.substring(divisionIndexes[aa], divisionIndexes[aa+1]));
      }

      let allSpeakersList: Array<Speaker> = [];
      let allTeamsList: Array<Team> = [];
      for(let testing_string of strings_to_test) {
        let listOfAllStrings = (testing_string.match(full_line_rx)) || [];
        for(let ind in listOfAllStrings) {
          let k = listOfAllStrings[ind];
          if(k.match(rx_by_division) || k.indexOf(",,,,,,,,,,,,") != -1) continue;
          let decipherStringRx = /[^,]*/g;
          let speakerInfo: any[] = (k.match(decipherStringRx)) || [];
          let isFirst: boolean = speakerInfo[0] != '';
          speakerInfo = (isFirst ? speakerInfo.splice(2) : speakerInfo.splice(1));
          let speakerX: Speaker = {
            division: parseInt(speakerInfo[4]) < 300 ? "Middle School" : parseInt(speakerInfo[4]) < 500 ? "Novice" : parseInt(speakerInfo[4]) < 800 ? "Open" : "Varsity",
            id: speakerInfo[4],
            teamid: speakerInfo[2],
            name_cn: speakerInfo[6],
            name_en: speakerInfo[8],
            school: speakerInfo[22]!=""?speakerInfo[22]:speakerInfo[23]
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

        setSpeakers(allSpeakersList);
        setTeams(allTeamsList);
        setLoadedOne(true);
      }
    } else if (type==2 || type==3) {
      let rx = /.*\n/g;
      let thingsToParse: any[] = (input.match(rx) || []);
      if(thingsToParse.length < 1) return;

      thingsToParse = thingsToParse.splice(1);
      let matchNumberRx = /\d{3,}/g;
      let inOrder = [];

      for (let item of thingsToParse) {
        let numberString = ((item.match(matchNumberRx) || [])[0]);
        let searchArray = (type==2 ? speakers : teams);
        inOrder.push(getItOut(searchArray, numberString));
      }

      if(type==2) {
        let temp: any[] = speakersInOrder;
        temp = temp.concat(inOrder);
        setSpeakersIO(temp);
        setLoadedTwo(true);
      } else {
        let temp: any[] = teamsInOrder;
        temp = temp.concat(inOrder);
        setTeamsIO(temp);
        setLoadedThree(true);
      }
    } else {
      console.log("How did we get here?")
    }
  }

  const exportAsPicture = () => {
    if (!loadedOne || !loadedTwo || !loadedThree) {
      console.error("Didn't load all files, but we'll generate the image anyway because sometimes that's acceptable.")
    }
    let data = document.getElementById('CONTAINER_TO_EXPORT')!
    html2canvas(data).then((canvas)=>{
      let image = canvas.toDataURL('image/png', 1.0);
      let fileName = `${division}_${typeOfAward}.png`;
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

  const [topx, setTopx] = useState(0);
  const redColorHex = "#FF6961";

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools - Rankings</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      {navBar}
      <div className={styles.content}>
        <div className={styles.heading}>Generate Rankings</div>
        
        <div className={styles.form}>

          <div className={styles.label}>Upload the NHSDLC <em>STUDENT NAMELIST SPREADSHEET</em> from Tencent Docs as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Student Namelist CSV:&nbsp;<input onChange={(e: any) => setFile1(e.target.files[0])} type={"file"} id={"csvFileInput"} accept={".csv"}/></div>
            <button style={{border: loadedOne ? `1px solid #ECC132` : `1px solid ${redColorHex}`}} onClick={(e: any) => {handleOnSubmit(e, fileOne, 1)}}>Upload Namelist CSV</button>
          </div>

          <div className={styles.label}>Upload the Tabroom <em>SPEAKER RANK SPREADSHEET</em> as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Speaker Ranks CSV:&nbsp;<input onChange={(e: any) => setFile2(e.target.files[0])} type={"file"} id={"csvFileInput"} accept={".csv"}/></div>
            <button style={{border: loadedTwo ? `1px solid #ECC132` : `1px solid ${redColorHex}`}} onClick={(e: any) => {handleOnSubmit(e, fileTwo, 2)}}>Upload Speaker Rank CSV</button>
          </div>

          <div className={styles.label}>Upload the Tabroom <em>TEAM RANK SPREADSHEET</em> as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Team Ranks CSV:&nbsp;<input onChange={(e: any) => setFile3(e.target.files[0])} type={"file"} id={"csvFileInput"} accept={".csv"}/></div>
            <button style={{border: loadedThree ? `1px solid #ECC132` : `1px solid ${redColorHex}`}} onClick={(e: any) => {handleOnSubmit(e, fileThree, 3)}}>Upload Team Rank CSV</button>
          </div>

          <div className={styles.label}>Choose which one to export.</div>
          <div className={styles.sublabel} style={{flexDirection: "column"}}>
              <div style={{padding: "1rem", display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
                <div style={{marginRight: "1rem"}}><input checked={!isShowBreaks} onChange={(_) => {setIsShowBreaks(!isShowBreaks); setAwardType(`Top ${topx} Speaker Awards`)}} type={'radio'}/> Speakers</div>
                <div style={{marginRight: "1rem"}}><input checked={isShowBreaks} onChange={(_) => {setIsShowBreaks(!isShowBreaks); setAwardType(`Breaking Teams`)}} type={'radio'}/> Break List</div>
                <div>How many? <input type={'number'} style={{width: "11rem"}} value={topx} onChange={(e: any) => {setTopx(e.target.value); { if (!isShowBreaks) setAwardType(`Top ${e.target.value} Speaker Awards`)}}} placeholder={`top how many ${isShowBreaks ? "teams" : "speakers"}?`}/></div>
              </div>
              <div style={{padding: "1rem", paddingTop: "0", display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
                <div style={{marginRight: "1rem"}}><input checked={division=="Middle School"} onChange={(_) => {setDivision("Middle School")}} type={'radio'}/> Middle School</div>
                <div style={{marginRight: "1rem"}}><input checked={division=="Open"} onChange={(_) => {setDivision("Open")}} type={'radio'}/> Open</div>
                <div style={{marginRight: "1rem"}}><input checked={division=="Novice"} onChange={(_) => {setDivision("Novice")}} type={'radio'}/> Novice</div>
                <div><input checked={division=="Varsity"} onChange={(_) => {setDivision("Varsity")}} type={'radio'}/> Varsity (if unavailable, will show nothing)</div>
              </div>
          </div>

          <div className={styles.label}>Export as an image, and release to judges and debaters. Please use a laptop for this.</div>
          <div className={styles.sublabel}>
          <button onClick={exportAsPicture}>Export to Image</button>
          </div>

          <div className={stylesQ.tables} id="CONTAINER_TO_EXPORT">

          {(teamsInOrder.length > 1) || (speakersInOrder.length > 1) ? (<div className={stylesQ.headers}>
            <div className={stylesQ.divisionName}>{division}</div>
            <div className={stylesQ.roundName}>{typeOfAward}</div>
          </div>) : ""}
            
          {(speakersInOrder.length > 1) && (isShowBreaks) ? (<div className={stylesQ.boxA}>
          <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.three}>
            <tr style={{height: "1rem"}}><td style={{width:"10%"}}>Rank</td><td style={{width:"10%"}}>Team Code</td><td style={{width:"40%"}}>Speaker 1</td><td style={{width:"40%"}}>Speaker 2</td></tr>
            <BreakTable teams={teamsInOrder} division={division} topx={topx}/>
          </table></div>) : ""}

          {(teamsInOrder.length > 1) && (!isShowBreaks) ? (<div className={stylesQ.boxA}>
          <table cellSpacing="0" cellPadding="0" className={stylesQ.table} id={stylesQ.three}>
            <tr style={{height: "1rem"}}><td style={{width:"10%"}}>Rank</td><td style={{width:"10%"}}>Speaker Code</td><td style={{width:"40%"}}>Speaker Name</td><td style={{width:"40%"}}>Speaker School</td></tr>
            <SpeakerTable speakers={speakersInOrder} division={division} topx={topx}/>
          </table></div>) : ""}

          {(teamsInOrder.length > 1) || (speakersInOrder.length > 1) ? (<div className={stylesQ.footer}><img alt={"Logo"} src={"/logo.png"}/></div>) : ""}

          </div>

        </div>
        
        
      </div>
    </div>
  );
};

export default Home;