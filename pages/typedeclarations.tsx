import type { NextPage } from 'next';
import React from 'react';

export type Speaker = {
    division: string,
    id: number,
    teamid: number
    name_cn: string,
    name_en: string,
    school: string
}

export type Team = {
    division: string,
    id: number,
    speaker1: Speaker,
    speaker2: Speaker
}

export type Round = {
    roundid: number, // should use uuid
    name: string,
    number: number, // 1, 2, 3, etc.
    isPrelim: boolean,
    done: boolean,
    rawData?: string, // raw csv
    encodedImag?: any
}

export type Results = {
    speakerOrder: [Speaker],
    teamOrder: [Team],
    winningTeams: [Team],
    numberOfTopSpeakers: number
}

export type Tournament = {
    tournamentid: number,
    name: string,
    location: string,
    startTime: Date,
    endTime: Date,
    rounds: Round[],
    locked: boolean,
    results?: Results
}

export type Tool = {
    id: number,
    name: string,
    description: string,
    link: string,
    active: boolean
}

export type Debate = {
    flight: string;
    teamA: string;
    teamB: string;
    roomCode: string;
    judgeName: any;
};

const Home: NextPage = () => (<></>);

export default Home;