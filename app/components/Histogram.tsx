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
        <BarChart
            xAxis={[{
              scaleType: 'band',
              data: ['Tests'],
              labelStyle: {fill: 'black', fontSize: 16, fontWeight: 500},
            }]}
            series={[{data: [47], label: 'Accepted'}, {data: [53], label: 'Rejected'}]} // Combine all data into a single series
            margin={{top: 30, right: 30, bottom: 50, left: 30}}
            axisHighlight={{x: 'none', y: 'none'}}
            colors={['#00FF00', '#FF0000']}
        />
      </div>
  );
}

export default Histogram;
