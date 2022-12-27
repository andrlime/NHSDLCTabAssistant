/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { useRef,  useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import type { Tool, Team, Speaker } from './typedeclarations';

type Division = {
  speakersInOrder: Speaker[],
  teamsInOrder: {team: any, label: string}[]
}

const toolbox: Tool[] = [
  {id: 1, name: "Pairings Generator", description: "Generate pairings image from horizontal schematic", link: "/pair", active: false},
  {id: 2, name: "Results Image Generator", description: "Generator results as an image", link: "/results", active: false},
  {id: 3, name: "Results Spreadsheet Generator", description: "Generate results for a given division as a csv file", link: "/resultscsv", active: true},
  {id: 10, name: "Tabroom Import Spreadsheet Convertor", description: "Convert DLC namelist to Tabroom format spreadsheet", link: "/tabroom", active: false},
  {id: 99, name: "Evaluate Judges", description: "Judge evaluation system", link: "/evaluate", active: false}
];

const Home: NextPage = () => {
  const [divisions, setDivisions] = useState<Division>();
  
  const [divisionOneFile, setD1File] = useState();
  const [divisionOneRawFile, setD1RFile] = useState();
  const [divisionOneNumber, setD1No] = useState(0);
  const [divisionOneName, setD1Name] = useState("");
  const [divisionOneTeams, setD1Te] = useState(""); // also counts as teams raw data
  
  const [namelist, setNamelist] = useState();
  const [allSpeakers, setAS] = useState<Array<Speaker>>([]);
  const [allTeams, setAT] = useState<Array<Team>>([]);
  const [loadedTL, setLoadedTL] = useState(false);
  
  const teamsRaw = useRef("");
  const speakersRawData = useRef("");
  const rawNamelist = useRef<Array<string>>([]);

  const readFile = async (file: any) => {
    if (!file) return
    const data = await file.text()
    return data;
  }

  const uploadNamelist = (e: any, fileVariable: any) => {
      e.preventDefault();
      if (fileVariable) {
        readFile(fileVariable).then((e) => {
          processNamelist(e);
        }
      );
      }
  };

  const processData = (number: number, name: string, teams: string, file: any, fileTwo: any, index: number) => {
    console.log("Processing...")
    //first, process the file
    readFile(file).then((input) => {
      speakersRawData.current = input;
      console.log("Read the file ", input.length)
      let rx = /.*\n/g;
      let thingsToParse: any[] = (input.match(rx) || []);
      if(thingsToParse.length < 1) return;

      thingsToParse = thingsToParse.splice(1);
      let matchNumberRx = /\d{3,}/g;
      let inOrder: any[] = [];

      for (let item of thingsToParse) {
        let numberString = ((item.match(matchNumberRx) || [])[0]);
        let searchArray = allSpeakers;
        inOrder.push(getItOut(searchArray, numberString));
      }

      //inOrder is of type [Speaker]
      
      //then, process the team list
      let RX_TEAM_LIST = /\b\d+ \w* \d*/g;
      let matches = teams.match(RX_TEAM_LIST) || [];
      let teamsArray: Array<{team: any, label: string}> = [];
      for(let t of matches) {
        let AAA = t.split(' ');
        teamsArray.push({team: getItOut(allTeams, AAA[2]), label: `${name} ${AAA[1]=="1st" ? "Champion" : AAA[1]=="2nd" ? "Runner Up" : AAA[1]}`});
      }

      inOrder = inOrder.slice(0,number);

      //now, push it
      setDivisions({speakersInOrder: inOrder, teamsInOrder: teamsArray});
    });

    readFile(fileTwo).then((input) => {
      console.log("Read the file ", input.length)
      let rx = /.+/g;
      let thingsToParse: any[] = (input.match(rx) || []);
      if(thingsToParse.length < 1) return;

      thingsToParse = thingsToParse.splice(1);
      let output = "";

      for (let item of thingsToParse) {
        let subsssss = ((item+"").match(/.*\d{6}/g) || "")[0];
        output+=subsssss.split(',').join(" ") + " ";
      }
      teamsRaw.current = output;
    });
  }

  const salesSheet = (speakers: string, teams: string, winningTeams: string, namelist: string[]) => {
    let speakerLines = speakers.match(/.*/g) || [];
    let teamsLines = teams.match(/\b\d+ \w* \d*/g) || [];
    let winnerLines = winningTeams.match(/\b\d+ \w* \d*/g) || [];

    let division = divisionOneName=="Middle School"?"MS":divisionOneName=="Open"?"Open":divisionOneName=="Novice"?"Novice":"";
    if(speakerLines.length == 0 || teamsLines.length == 0 || winnerLines.length == 0) {
      console.log("WWW");
      return "";
    } else {
      let spkListAAA: Array<any> = [];
      for(let spk of speakerLines) {
        if(spk=="") continue;
        let data = spk.split(',');
        let rdDataSS = spk.substring(spk.indexOf("Rd"));
        let wCount = (rdDataSS.match(/W/g) || []).length;
        let lCount = (rdDataSS.match(/Rd/g) || []).length - wCount;
        spkListAAA.push({indivCode: parseInt((data[1].match(/\d+/g) || ["000"])[0]), indivAwards: parseInt(data[0]) <= divisionOneNumber ? `Speaker Award ${data[0]}` : "", indivRank: data[0], prelimWins: wCount, prelimLosses: lCount, teamCode: 0});
      }

      let wlListAAA: Array<any> = [];
      for(let wl of winnerLines) {
        let data = wl.split(' ');
        wlListAAA.push({teamCode: data[2], teamRank: data[0], teamAward: data[1]})
      }

      let tmListAAA: Array<any> = [];
      for(let tm of teamsLines) {
        let data = tm.split(' ');
        let award = "";
        let targetTeamCode = data[2];
        for(let k of wlListAAA) {
          if(k.teamCode==targetTeamCode) award=k.teamAward;
        }
        tmListAAA.push({teamCode: data[2], teamRank: data[0], teamAward: award});
      }

      console.log(spkListAAA, tmListAAA, teamsLines);

      spkListAAA = (spkListAAA.sort((a,b) => a.indivCode - b.indivCode)).slice(1); // this is now sorted

      //actually do it
      //format is
      // 队伍编号 个人编号	分组	姓名 (汉字）	姓名的拼音	性别	电子邮件	联系电话	学校	年级	家长联系电话	Team Awards	Individual Award	Team rank	Prelim Wins	Prelim Losses	Speaker rank
      type LineSales = {
        teamCode: number, // get from team line D
        indivCode: number, // get from team line, i.e. find speaker 1 and speaker 2 id, and then search the speaker list
        division: string, // get from list items D
        chineseName: string,
        pinyinName: string,
        gender: string,
        email: string,
        phone: string,
        school: string,
        gradeLevel: string,
        parentPhone: string,
        teamAwards: string, // get from team string D
        indivAwards: string, // get from speakers string D
        teamRank: number, // team string D
        indivRank: number, // speakers string D
        prelimWins: number, // count Ws and Rds in the speaker thingy D
        prelimLosses: number // see above D
      }; // type of a single line in the sheet

      let whichNamelistAmILookingAt = "";
      for(let tml of namelist) {
        if(tml.indexOf(division)!=-1) whichNamelistAmILookingAt = tml;
      }

      let allSpeakerInfoList = ((whichNamelistAmILookingAt.match(/.+/g)) || []);

      let output = "队伍编号,个人编号,中文姓名,拼音姓名,性别,电子邮箱,联系电话,学校,年级,家长电话,团队奖项,个人奖项,团队排名,个人排名,预选赛Wins,预选赛Losses\n"
      for(let singleSpeaker of allSpeakerInfoList) {
        if(singleSpeaker.indexOf(',,,,,,,,,,')!=-1) continue;
        let data = singleSpeaker.split(',');
        let speakerCodeTarget = parseInt(data[3]);
        let teamCodeTarget = parseInt(data[2]);
        // i need the speaker info
        let speakerThatIWant, teamThatIWant;

        for(let spk of spkListAAA) {
          if(spk.indivCode == speakerCodeTarget) speakerThatIWant = spk;
        }

        for(let tm of tmListAAA) {
          if(tm.teamCode == teamCodeTarget) teamThatIWant = tm;
        }

        console.log(data);

        if(speakerThatIWant && teamThatIWant) {
          let line: LineSales = {
            teamCode: teamCodeTarget,
            indivCode: speakerCodeTarget,
            division: division,
            chineseName: data[4],
            pinyinName: data[5],
            gender: data[7],
            email: data[9],
            phone: data[10],
            school: data[12].match(/G*\d/g) ? data[13] : data[12], // if birthday is blank go back one
            gradeLevel: data[14],
            parentPhone: data[16],
            teamAwards: teamThatIWant.teamAward,
            indivAwards: speakerThatIWant.indivAwards,
            teamRank: teamThatIWant.teamRank,
            indivRank: speakerThatIWant.indivRank,
            prelimWins: speakerThatIWant.prelimWins,
            prelimLosses: speakerThatIWant.prelimLosses
          }
          output+=`${line.teamCode},${line.indivCode},${line.chineseName},${line.pinyinName},${line.gender},${line.email},${line.phone},${line.school},${line.gradeLevel},${line.parentPhone},${line.teamAwards},${line.indivAwards},${line.teamRank},${line.indivRank},${line.prelimWins},${line.prelimLosses}\n`;
        }
      }

      return output;
    }
  }

  const processNamelist = (input: string) => {
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
    strings_to_test.push(allStudents.substring(divisionIndexes[divisionIndexes.length-1]));

    rawNamelist.current = strings_to_test; // this just has one massive string per division

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

      setAS(allSpeakersList);
      setAT(allTeamsList);
      setLoadedTL(true);
    }
  }

  const getItOut = (list: Array<Speaker | Team>, key: string) => {
    for(let thingy of list) {
      if((thingy.id + "") == key) {
        return thingy;
      }
    }
  }

  const exportAsCsv = (divisionName: string) => {
    let data = divisions ? convertToCsv(divisionName) : "";
    data = 'data:text/csv;charset=utf-8,' + encodeURI(data);
    let fileName = `${divisionName}_Results.csv`;
    saveAs(data, fileName)
  }

  const exportSalesSheet = (speakers: string, teams: string, winningTeams: string, namelist: string[]) => {
    let data = salesSheet(speakers, teams, winningTeams, namelist);
    data = 'data:text/csv;charset=utf-8,' + encodeURI(data);
    let fileName = `${divisionOneName}_销售总结.csv`;
    saveAs(data, fileName)
  }

  const convertToCsv = (name: string) => {
    if (!divisions) return "how did this happen?!?!"; // this code WILL NOT RUN
    else {
      let [tms, spks] = [divisions.teamsInOrder, divisions.speakersInOrder];
      console.log(tms, spks);
      let outputString = `${name} Results Spreadsheet,Generated on ${new Date().toISOString()},,,,\n`;
      for (let team of tms) {
        if(team.team) outputString += `${team.label},${team.team.id},${team.team.speaker1.name_cn},${team.team.speaker1.school},${team.team.speaker2.name_cn},${team.team.speaker2.school}\n`;
      }

      for (let speaker of spks) {
        outputString += `Speaker ${spks.indexOf(speaker)+1},${speaker.id},${speaker.name_cn},${speaker.school},,\n`;
      }

      return outputString;
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

  const [burger, setBurger] = useState(true);

  const navBar = (<div className={styles.navbar}>
    <div className={burger ? styles.burger : styles.cross} onClick={_ => setBurger(!burger)}><span></span><span></span><span></span></div>
    <div style={{padding: "1rem", color: "#0E397A"}}/>
    {!burger ? (<div>
      {toolbox.map((item, index) => (
        <Link key={item.id**index*14} href={item.link}><div className={styles.menuLabel} style={{backgroundColor: item.active ? "#ECC132" : "", color: item.active ? "black" : ""}}>{item.name}</div></Link>
      ))}
    </div>) : ""}
  </div>);

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools - Results</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      {navBar}
      <div className={styles.content}>
        <div className={styles.heading}>Generate Results Spreadsheets</div>
        
        <div className={styles.form}>

          <div className={styles.label}>Upload Student Namelist CSV</div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
              Student Namelist CSV:&nbsp;
              <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={(e: any) => setNamelist(e.target.files[0])}/>
              <button onClick={(e: any) => {uploadNamelist(e, namelist)}}>
                  Upload Student Namelist CSV
              </button>
          </div>

          <div className={styles.label}>Division Files / Data Input</div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
              Speaker Ranks CSV:&nbsp;
              <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={(e: any) => setD1File(e.target.files[0])}/>
          </div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
              Team Ranks Raw Data:&nbsp;
              <textarea placeholder='type a random character to get just top speakers' id={"csvFileInput"} style={{width: "50%", height: "100%"}} value={divisionOneTeams} onChange={(e: any) => setD1Te(e.target.value)}/>
          </div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
              Team Ranks CSV:&nbsp;
              <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={(e: any) => setD1RFile(e.target.files[0])}/>
          </div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
            <div style={{marginRight: "1rem"}}>Number of Speakers:&nbsp;<input value={divisionOneNumber} onChange={(e: any) => setD1No(e.target.value)} type={'number'}/></div>
            <div style={{marginRight: "1rem"}}>Name of Division:&nbsp;<input value={divisionOneName} onChange={(e: any) => setD1Name(e.target.value)} type={'text'}/></div>
            <button onClick={(e: any) => {
              if(loadedTL && divisionOneNumber > 0 && divisionOneName!="" && divisionOneTeams.length>0 && divisionOneFile!=null) processData(divisionOneNumber, divisionOneName, divisionOneTeams, divisionOneFile, divisionOneRawFile, 0);
              else console.log("??");
            }}>
              Upload Data
            </button>
          </div>

          <div className={styles.label}>Click to export AWARDS as a csv 导出奖项表格</div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
          <button onClick={_ => {if (loadedTL && divisions) exportAsCsv(divisionOneName)}} style={{width: "fit-content"}}>Export</button>
          </div>

          <div className={styles.label}>Click to export EVERYTHING as a csv 导出销售表格</div>
          <div style={{padding: "0.5rem", paddingLeft: "0rem"}} className={styles.sublabel}>
          <button onClick={_ => {if (loadedTL && divisions) exportSalesSheet(speakersRawData.current, teamsRaw.current, divisionOneTeams, rawNamelist.current)}} style={{width: "fit-content"}}>Export</button>
          </div>

        </div>
        
        
      </div>
    </div>
  );
};

export default Home;