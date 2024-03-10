import React from "react";
import { BarChart } from "@mui/x-charts";

export const data = [
  ["Key", "Value"],
  ["Accepted", 47],
  ["Rejected", 53],
  ["Suggested", 40],
];

export const options = {
  title: "Number of Accepted/Rejected Tests",
  legend: { position: "none" },
};

export function Histogram() {
  return (
      <div className='w-[90%] h-[100%]'>

      </div>
  );
}

export default Histogram;
