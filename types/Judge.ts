import {
    ObjectId
} from "mongodb";
import {
    Evaluation
} from "./Evaluation";

export type Judge = {
    _id: ObjectId | string,
    name: string,
    email: string,
    evaluations: Evaluation[]
};

// methods
export const computeStdev = (judge: Judge): number => {
    const partialList = [];
    for (const i of judge.evaluations) {
        partialList.push(i.bias + i.citation + i.comparison + i.coverage + i.decision);
    }

    // compute stdev of that list
    const sumOfList = partialList.reduce((accum, current) => accum + current, 0);
    const mean = sumOfList / partialList.length;

    const sumOfVariances = partialList.reduce((accum, current) => accum + ((current - mean) ** 2), 0);
    return (sumOfVariances / (partialList.length - 1)) ** (0.5);
}

export const computeZ = (judge: Judge, judges: Judge[]): number => {
    // total weighted score of all judges and stdev
    let wsum = 0;
    let wtotal = 0;
    let numberOfEvaluations = 0;
    for (let j of judges) {
        for (let ev of j.evaluations) {
            wsum += (ev.bias + ev.citation + ev.comparison + ev.coverage + ev.decision) * ev.weight;
            wtotal += ev.weight;
            numberOfEvaluations++;
        }
    }

    const W_AVG_ALLJUDGES = wsum / wtotal;

    //// stdev, all judges
    let variance = judges.reduce((accum, current) => accum + current.evaluations.reduce((a, c) => a + ((c.bias + c.citation + c.comparison + c.coverage + c.decision - W_AVG_ALLJUDGES) ** 2), 0), 0)
    const SD_ALLJUDGES = (variance / numberOfEvaluations) ** 0.5;

    // total weighted score of just this judge and stdev
    wsum = 0;
    wtotal = 0;
    numberOfEvaluations = 0;
    for (let ev of judge.evaluations) {
        wsum += (ev.bias + ev.citation + ev.comparison + ev.coverage + ev.decision) * ev.weight;
        wtotal += ev.weight;
        numberOfEvaluations++;
    }
    const W_AVG_JUST_THIS_JUDGE = wsum / wtotal;

    variance = judge.evaluations.reduce((a, c) => a + ((c.bias + c.citation + c.comparison + c.coverage + c.decision - W_AVG_ALLJUDGES) ** 2), 0);
    const SD_JUST_THIS_JUDGE = (variance / numberOfEvaluations) ** 0.5;

    // if you can read all of that without blinking, you deserve a raise
    // find the z score
    let z = (W_AVG_ALLJUDGES - W_AVG_JUST_THIS_JUDGE) / ((((SD_ALLJUDGES ** 2) / (judges.length)) + ((SD_JUST_THIS_JUDGE ** 2) / (judge.evaluations.length))) ** (0.5));
    return -1 * z;
}

export const computeMean = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.bias + ev.citation + ev.comparison + ev.coverage + ev.decision);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;
        
        for (let ev of j.evaluations) {
            wsum += (ev.bias + ev.citation + ev.comparison + ev.coverage + ev.decision) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}

export const computeMeanDecision = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.decision);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;

        for (let ev of j.evaluations) {
            wsum += (ev.decision) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}

export const computeMeanCoverage = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.coverage);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;
        
        for (let ev of j.evaluations) {
            wsum += (ev.coverage) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}

export const computeMeanCitation = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.citation);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;
        
        for (let ev of j.evaluations) {
            wsum += (ev.citation) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}

export const computeMeanComparison = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.comparison);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;
        
        for (let ev of j.evaluations) {
            wsum += (ev.comparison) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}

export const computeMeanBias = (j: Judge, f?: string[]): number => {
    // f is filters
    if ( f ) { // yes filters, only do the ones inside filters
        let averages = [];
        for(let currentFilter of f) { // HORRIBLE O(n^4)?
            let count = 0;
            let sum = 0;
            for (let ev of j.evaluations) {
                if(ev.tournamentName == currentFilter) {
                    count++;
                    sum+=(ev.bias);
                }
            }
            averages.push(sum/count);
        }

        // now i have all the averages, so i want to average the averages

        return averages.reduce((acc, cur) => acc+cur,0)/averages.length;
    } else { // no filters, do all of them
        let wsum = 0;
        let wtotal = 0;
        
        for (let ev of j.evaluations) {
            wsum += (ev.bias) * ev.weight;
            wtotal += ev.weight;
        }

        return wsum / wtotal;
    }
}