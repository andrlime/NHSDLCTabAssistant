/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import Link from 'next/link';
import React, { FunctionComponent, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Q.module.css';
import type { Tool } from './typedeclarations';

const toolbox: Tool[] = [
  {id: 1, name: "Pairings Generator", description: "Generate pairings image from horizontal schematic", link: "/pair", active: false},
  {id: 2, name: "Results Image Generator", description: "Generator results as an image", link: "/results", active: false},
  {id: 3, name: "Results Spreadsheet Generator", description: "Generate results for a given division as a csv file", link: "/resultscsv", active: false},
  {id: 10, name: "Tabroom Import Spreadsheet Convertor", description: "Convert DLC namelist to Tabroom format spreadsheet", link: "/tabroom", active: false},
];

const ToolCard: FunctionComponent<{id: number, name: string, description: string, onClick?: any}> = ({id, name, description, onClick}) => (
  <div onClick={onClick} className={styles.card}>

    <div className={styles.emoji}>{getEmoji(id)}</div>

    <div className={styles.nl}>
      <div className={styles.name}>{name}</div>
      <div className={styles.location}>{description}</div>
    </div>

  </div>
);


const getEmoji = (id: number) => {
  const EMOJI_LIBRARY = ['👀', '⭐️', '🍎', '🫐', '📕', '🎃'];
  return EMOJI_LIBRARY[id%EMOJI_LIBRARY.length];
}

const Home: NextPage = () => {
  const [burger, setBurger] = useState(true);

  const navBar = (<div className={styles.navbar}>
    <div className={burger ? styles.burger : styles.cross} onClick={_ => setBurger(!burger)}><span></span><span></span><span></span></div>
    <div style={{padding: "1rem", color: "#0E397A"}}/>
    {!burger ? (<div>
      {toolbox.map((item, index) => (
        <Link key={index**item.id**5} href={item.link}><div className={styles.menuLabel} style={{backgroundColor: item.active ? "#ECC132" : "", color: item.active ? "black" : ""}}>{item.name}</div></Link>
      ))}
    </div>) : ""}
  </div>);

  return (
    <div className={styles.everything}>
      <Head>
        <title>NHSDLC Tabroom Tools</title>
        <link rel="icon" type="image/x-icon" href="/icon.png"/>
      </Head>
      {navBar}
      <div className={styles.content}>
        <div className={styles.heading}>Tools List</div>
        {toolbox.map((item, index) => (
          <Link key={item.id**index**4} href={item.link}>
            <ToolCard onClick={(e: any) => console.log(e)} key={item.id**index} id={item.id} name={item.name} description={item.description}/>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;