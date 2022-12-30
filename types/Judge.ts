import { ObjectId } from "mongodb";
import { Evaluation } from "./Evaluation";

export type Judge = {
    _id: ObjectId | string,
    name: string,
    email: string,
    evaluations: Evaluation[],
    totalEarnedPoints: number,
    totalPossiblePoints: number
};