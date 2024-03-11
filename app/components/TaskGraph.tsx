import React, {useContext} from "react";
import { Bar } from 'react-chartjs-2';
import { TestDecisionsContext } from "@/lib/TestContext";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend);

const TaskGraph = () => {
    const {testDecisions, currentTopic} = useContext(TestDecisionsContext);
    const restPE = testDecisions.PE.denied.length + testDecisions.PE.trashed.length;
    const restKE = testDecisions.KE.denied.length + testDecisions.KE.trashed.length;
    const restLCE = testDecisions.LCE.denied.length + testDecisions.LCE.trashed.length;

    const data_topic = {
        labels: ['PE', 'KE', 'LCE'],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [testDecisions.PE.approved.length, testDecisions.KE.approved.length, testDecisions.LCE.approved.length],
            backgroundColor: '#FFE58F'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [restPE, restKE, restLCE],
            backgroundColor: '#1AA367'
        }]
    };

    const data_acceptable = {
        labels: ['A', 'U', ''],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [20, 50],
            backgroundColor: '#FFE58F'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [60, 30],
            backgroundColor: '#1AA367'
        }]
    };

    const options = {
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            grace: 1,
          },
          y: {
            beginAtZero: true,
            stacked: true,
          }
        },
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                align: "start"
            }
        },
        responsive: true,
        maintainAspectRatio: true
    };

    return (
        <div className={'float-end border-gray-600 w-full h-3/4 justify-start items-center flex flex-col'}>
            <h2 className={'align-middle'}> Visualization </h2>
            <Bar data={data_topic} options={options}> </Bar>
            <Bar data={data_acceptable} options={options}> </Bar>
        </div>
    )
}

export default TaskGraph;
