import { FunctionComponent } from "react";
import Debate from "../../types/Debate";

export const FlightTable: FunctionComponent<{rounds: Array<Debate>}> = ({rounds}) => {
    return (
      <>
        {rounds.map((item, index) => (
          <tr key={index} style={{height: "1rem"}}>
            <td style={{width:"10%"}}>{item.flight}</td><td style={{width:"20%"}}>{item.teamA}</td><td style={{width:"20%"}}>{item.teamB}</td><td style={{width:"25%"}}>{item.roomCode}</td><td style={{width:"25%"}}>{item.judgeName}</td>
          </tr>
        ))}
      </>
    )
}