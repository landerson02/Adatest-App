import React, { useContext } from "react";
import { Bar } from 'react-chartjs-2';
import { TestDataContext } from "@/lib/TestContext";

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
    const { testData, currentTopic } = useContext(TestDataContext);
    const restPE = testData.decisions.PE.denied.length + testData.decisions.PE.trashed.length;
    const restKE = testData.decisions.KE.denied.length + testData.decisions.KE.trashed.length;
    const restLCE = testData.decisions.LCE.denied.length + testData.decisions.LCE.trashed.length;
    const totalTests = testData.decisions.KE.approved.length + restKE
        + testData.decisions.PE.approved.length + restPE
        + testData.decisions.LCE.approved.length + restLCE;

    const data_topic = {
        labels: ['PE', 'KE', 'LCE'],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [testData.decisions.PE.approved.length, testData.decisions.KE.approved.length, testData.decisions.LCE.approved.length],
            backgroundColor: '#1AA367'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [restPE, restKE, restLCE],
            backgroundColor: '#FF6242'
        }]
    };

    const data_acceptable = {
        labels: ['A', 'U', ''],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [20, 50],
            backgroundColor: '#1AA367'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [60, 30],
            backgroundColor: '#FF6242'
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
            <div className={'bg-gray-100 w-full h-12 justify-center items-center flex border-b border-gray-200'}>
                <h1 className={'align-middle text-2xl font-normal text-gray-600'}> Visualization </h1>
            </div>
            <div className={'justify-center p-7 float-start w-full'}>
                <p> Graded Essays in Total </p>
                <p className={'text-4xl font-serif'}> {totalTests} </p>
            </div>
            <Bar data={data_topic} options={options}> </Bar>
            {/* <Bar data={data_acceptable} options={options}> </Bar> */}
        </div>
    )
}

export default TaskGraph;
