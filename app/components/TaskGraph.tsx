import Histogram from "@/app/components/Histogram";
import {BarChart} from "@mui/x-charts";
import React from "react";

const TaskGraph = () => {
    return (
        <div className={'float-end border-gray-600 w-full h-3/4 justify-center items-center flex flex-col'}>
            <h1>Task Graph</h1>
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
    )
}

export default TaskGraph;
