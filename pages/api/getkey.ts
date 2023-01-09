import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
dotenv.config();

export default function getKey(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res
    .status(200)
    .json({ apiKey: process.env.API_KEY, backendUrl: process.env.BACKEND_URL });
}
