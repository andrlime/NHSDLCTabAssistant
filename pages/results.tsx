/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import stylesQ from '../styles/R.module.css';
import html2canvas from "html2canvas";
import NavigationBar from '../components/nav/NavigationMenu';
import Speaker from '../types/Speaker';
import Team from '../types/Team';
import { BreakTable } from '../components/dataviews/BreakTable';
import { SpeakerTable } from '../components/dataviews/SpeakerTable';
import FileUpload from '../components/create/FileUpload';

// can be polished later but for now this is fine

const Home: NextPage = () => {
  const [loadedOne, setLoadedOne] = useState(false);
  const [loadedTwo, setLoadedTwo] = useState(false);
  const [loadedThree, setLoadedThree] = useState(false);

  const [typeOfAward, setAwardType] = useState(""); // e.g. Top Speakers
  const [division, setDivision] = useState(""); // e.g. Middle School
  const [speakers, setSpeakers] = useState<Array<Speaker>>([]);
  const [teams, setTeams] = useState<Array<Team>>([]);
  const [topx, setTopx] = useState(0);
  const [speakersInOrder, setSpeakersIO] = useState<Array<Speaker>>([]);
  const [teamsInOrder, setTeamsIO] = useState<Array<Team>>([]);
  const [isShowBreaks, setIsShowBreaks] = useState(false); // if true, show a break table, otherwise, show a speakers table

  const getItOut = (list: Array<Speaker | Team>, key: string) => {
    for(let thingy of list) {
      if((String(thingy.id)) == key) {
        return thingy;
      }
    }
  }

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
      const rx_by_division = /[A-Z][a-zA-Z]+,{5,}/g;
      const full_line_rx = /.+/g; //matches all full lines
      let divisions = (allStudents.match(rx_by_division));
      let divisionIndexes = [0].concat(divisions?.map(e => allStudents.indexOf(e)) || []);
      let strings_to_test: string[] = [];
      for(let aa = 0; aa < divisionIndexes.length-1; aa ++) {
        strings_to_test.push(allStudents.substring(divisionIndexes[aa], divisionIndexes[aa+1]));
      }
      strings_to_test.push(allStudents.substring(divisionIndexes[divisionIndexes.length-1]));

      let allSpeakersList: Array<Speaker> = [];
      let allTeamsList: Array<Team> = [];
      for(let testing_string of strings_to_test) {
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

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools - Rankings Image Tool</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <NavigationBar pageIndex={1}/>
      <div className={styles.content}>
        <div className={styles.heading}>Generate Rankings</div>
        
        <div className={styles.form}>

          <div className={styles.label}>Upload the NHSDLC <em>STUDENT NAMELIST SPREADSHEET</em> from Tencent Docs as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Student Namelist CSV:&nbsp;<FileUpload callback={(e: any) => processInput(e, 1)} typesToAllow={".csv"}/></div>
          </div>

          <div className={styles.label}>Upload the Tabroom <em>SPEAKER RANK SPREADSHEET</em> as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Speaker Ranks CSV:&nbsp;<FileUpload callback={(e: any) => processInput(e, 2)} typesToAllow={".csv"}/></div>
          </div>

          <div className={styles.label}>Upload the Tabroom <em>TEAM RANK SPREADSHEET</em> as a CSV here.</div>
          <div className={styles.sublabel}>
            <div style={{whiteSpace: "nowrap", margin: "0.2rem"}}>Team Ranks CSV:&nbsp;<FileUpload callback={(e: any) => processInput(e, 3)} typesToAllow={".csv"}/></div>
          </div>

          <div className={styles.label}>Choose which one to export.</div>
          <div className={styles.sublabel} style={{flexDirection: "column"}}>
              <div style={{padding: "1rem", display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
                <div style={{marginRight: "1rem"}}><input checked={!isShowBreaks} onChange={(_) => {setIsShowBreaks(!isShowBreaks); setAwardType(`Top ${topx} Speaker Awards`)}} type={'radio'}/> Speakers</div>
                <div style={{marginRight: "1rem"}}><input checked={isShowBreaks} onChange={(_) => {setIsShowBreaks(!isShowBreaks); setAwardType(`Breaking Teams`)}} type={'radio'}/> Break List</div>
                <div>How many? <input type={'number'} style={{width: "11rem"}} value={topx} onChange={(e: any) => {setTopx(e.target.value); { if (!isShowBreaks) setAwardType(`Top ${e.target.value} Speaker Awards`)}}} placeholder={`top how many ${isShowBreaks ? "teams" : "speakers"}?`}/></div>
              </div>
              <div style={{padding: "1rem", paddingTop: "0", display: "flex", flexDirection: "row", alignItems: "center", width: "100%"}}>
                <div style={{marginRight: "1rem"}}><input checked={division=="Middle School"||division=="MS"} onChange={(_) => {setDivision("MS")}} type={'radio'}/> Middle School</div>
                <div style={{marginRight: "1rem"}}><input checked={division=="Open"||division=="O"} onChange={(_) => {setDivision("O")}} type={'radio'}/> Open</div>
                <div style={{marginRight: "1rem"}}><input checked={division=="Novice"||division=="N"} onChange={(_) => {setDivision("N")}} type={'radio'}/> Novice</div>
                <div><input checked={division=="Varsity"||division=="V"} onChange={(_) => {setDivision("V")}} type={'radio'}/> Varsity (if unavailable, will show nothing)</div>
              </div>
          </div>

          <div className={styles.label}>Export as an image, and release to judges and debaters. Please use a laptop for this.</div>
          <div className={styles.sublabel}>
          <button onClick={exportAsPicture}>Export to Image</button>
          </div>

          <div className={stylesQ.tables} id="CONTAINER_TO_EXPORT">

          {(teamsInOrder.length > 1) || (speakersInOrder.length > 1) ? (<div className={stylesQ.headers}>
            <div className={stylesQ.divisionName}>{division=="MS"?"Middle School":division=="O"?"Open":division=="N"?"Novice":"Varsity"}</div>
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