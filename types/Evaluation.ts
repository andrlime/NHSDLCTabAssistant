export type Evaluation = {
  tournamentName: string;
  date: Date | string;
  roundName: string; // e.g., Round 1 Flight A etc.
  isPrelim: boolean;
  isImprovement: boolean;
  decision: number;
  comparison: number;
  citation: number;
  coverage: number;
  bias: number;
  weight: number;
};
