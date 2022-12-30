/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import React from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import NavigationBar, { ToolList } from '../components/nav/NavigationMenu';

const Home: NextPage = () => {
  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      <NavigationBar pageIndex={-1}/>
      <div className={styles.content}>
        <div className={styles.heading}>Tools List</div>
        <ToolList/>
      </div>
    </div>
  );
};

export default Home;