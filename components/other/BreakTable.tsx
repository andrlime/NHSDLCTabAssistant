import { FunctionComponent } from "react"
import Team from "../../types/Team"

export const BreakTable: FunctionComponent<{teams: Array<Team>, division: string, topx: number}> = ({teams, division, topx}) => {
    return (
      <>
        {(teams.filter(e => {
          if(division=="MS" || division=="Middle School") return e.division=="MS"||e.division=="Middle School"
          else if(division=="Open"||division=="O") return e.division=="O"||e.division=="Open"
          else if(division=="Novice"||division=="N") return e.division=="N"||e.division=="Novice"
          else if(division=="V" || division=="Varsity") return e.division=="V"||e.division=="Varsity"
        })).slice(0,topx).map((item, index) => (
          <tr key={index} style={{height: "1rem"}}>
            <td style={{width:"10%"}}>{index+1}</td><td style={{width:"10%"}}>{item.id}</td><td style={{width:"40%"}}>{item.speaker1.name_cn} - {item.speaker1.school}</td><td style={{width:"40%"}}>{item.speaker2.name_cn} - {item.speaker2.school}</td>
          </tr>
        ))}
      </>
    )
}