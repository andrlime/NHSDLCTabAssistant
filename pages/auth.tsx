/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import authstyles from '../styles/auth.module.css'
import axios from 'axios';
import { useRouter } from 'next/router';

const Home: NextPage = () => {

  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [fail, setFail] = useState(false);

  const backendUrl = useRef("");
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/getkey").then((res)=> {
      backendUrl.current = res.data.backendUrl || "localhost:9095";
      // replace later
      if(localStorage.user && localStorage.pass) {
        setUser(localStorage.user);
        setPass(localStorage.pass);
        axios.get(`https://${backendUrl.current}/authy/${localStorage.user}/${localStorage.pass}`).then((resp: any) => {
          let out = (resp.data.result);
          if(out != -1) {
            //log in success
            setFail(false);

            localStorage.setItem('user', username);
            localStorage.setItem('pass', password);

            router.push(`/evaluate?auth=true&code=${resp.data.result}`, '/evaluate');
          } else {
            setFail(true);
          }
        })
      }
    })
  },[])

  const login = () => {
    if(username == "" || password == "") return;
    axios.get(`https://${backendUrl.current}/authy/${username}/${password}`).then((resp: any) => {
      let out = (resp.data.result);
      if(out != -1) {
        //log in success
        setFail(false);

        localStorage.setItem('user', username);
        localStorage.setItem('pass', password);

        router.push(`/evaluate?auth=true&code=${resp.data.result}`, '/evaluate');
      } else {
        setFail(true);
      }
    })
  }

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Judge Evaluation System</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <div className={styles.content} style={{backgroundColor: "#0e397a", height: "100vh", display: "flex"}}>
        <div className={authstyles.authform}>

          <div>Username: <input style={{border: fail ? "2.5px solid red" : "2.5px solid #0e397a"}} value={username} type={'text'} placeholder="Username" onChange={(e) => setUser(e.target.value)}/></div>
          <div>Password: <input style={{border: fail ? "2.5px solid red" : "2.5px solid #0e397a"}} value={password} type={'password'} placeholder="Password" onChange={(e) => setPass(e.target.value)}/></div>
          <div><button onClick={login}>Login</button></div>

        </div>
      </div>
    </div>
  );
};

export default Home;