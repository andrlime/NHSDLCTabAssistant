import { FunctionComponent, useState } from "react";
import styles from '../styles/Q.module.css';

export const DeleteButton: FunctionComponent<{callback: Function, id: number | string, deleteMessage: string}> = ({callback, id, deleteMessage}) => {
  const [confirm, setConfirm] = useState(false);
  return (<div className={styles.deleteElement}>

    <button onClick={(_) => {
      if (confirm) {
        callback(id);
      } else {
        setConfirm(true);
      }
    }} style={{padding: "0.2rem"}}>{confirm ? "Confirm?" : deleteMessage}</button>

  </div>);
}

export default DeleteButton;