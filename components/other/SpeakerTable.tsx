import { FunctionComponent } from "react"
import Speaker from "../../types/Speaker"

export const SpeakerTable: FunctionComponent<{speakers: Array<Speaker>, division: string, topx: number}> = ({speakers, division, topx}) => {
    return (
      <>
        {(speakers.filter(e => {
          if(division=="MS" || division=="Middle School") return e.division=="MS"||e.division=="Middle School"
          else if(division=="Open"||division=="O") return e.division=="O"||e.division=="Open"
          else if(division=="Novice"||division=="N") return e.division=="N"||e.division=="Novice"
          else if(division=="V" || division=="Varsity") return e.division=="V"||e.division=="Varsity"
        })).slice(0,topx).map((item, index) => (
          <tr key={index} style={{height: "1rem"}}>
            <td style={{width:"10%"}}>{index+1}</td><td style={{width:"10%"}}>{item.id}</td><td style={{width:"40%"}}>{item.name_cn}</td><td style={{width:"40%"}}>{item.school}</td>
          </tr>
        ))}
      </>
    )
}