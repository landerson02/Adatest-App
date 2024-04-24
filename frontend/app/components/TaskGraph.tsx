'use client';
import React, {useContext, useEffect, useState} from "react";
import { Bar } from 'react-chartjs-2';
import { TestDataContext } from "@/lib/TestContext";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import {perturbedTestType, testDataType, testType} from "@/lib/Types";
import {getPerturbations, getTests} from "@/lib/Service";
import Options from "@/app/components/Options";

ChartJS.register(BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title);

const TaskGraph = () => {

    const {testData, currentTopic} = useContext(TestDataContext);
    // Currently selected Perturbation from the filter used in the last graph
    const [selectedPerturbation, setSelectedPerturbation] = useState<string>('spelling'); // New state

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
            backgroundColor: '#52C41A'
        },
            {
                label: 'Not Matching Your Evaluation',
                data: [restPE, restKE, restLCE],
                backgroundColor: '#FF4D4F'
            }]
    };

    const data_perturbations = {
        labels: ['Spelling', 'Negation', 'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish'],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [5, 10, 5, 10, 5, 10, 5],
            backgroundColor: '#52C41A'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [10, 5, 10, 5, 10, 5, 10],
            backgroundColor: '#FF4D4F'
        }]
    };

    const data_acceptable = {
        labels: ['Acceptable', 'Unacceptable', ''],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [20, 50],
            backgroundColor: '#52C41A'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [60, 30],
            backgroundColor: '#FF4D4F'
        }]
    };

    const createOptions = (title: string) => ({
        indexAxis: "y",
        scales: {
            x: {
                stacked: true,
                grace: 4,
            },
            y: {
                beginAtZero: true,
                stacked: true,
                afterFit: function (axis: any) {
                    axis.width = 85;
                },
            }
        },
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                align: "start"
            },
            title: {
                display: true,
                text: title,
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        borderRadius: 10,
    });

    // Usage:
    const options = createOptions('Your New Title');

    return (
        <div className={'float-end border-gray-600 w-full h-full justify-start items-center flex flex-col'}>
            <div className={'bg-gray-100 w-full h-12 justify-center items-center flex border-b border-gray-200'}>
                <h1 className={'align-middle text-2xl font-normal text-gray-600'}> Visualization </h1>
            </div>
            <div className={'justify-center p-7 float-start w-full'}>
                <p> Graded Essays in Total </p>
                <p className={'text-4xl font-serif'}> {totalTests} </p>
            </div>
            <div className={'w-full h-[20%]'}>
                <Bar data={data_topic} options={createOptions("Tests by Topic")}> </Bar>
            </div>
            <div className={'w-full h-[40%]'}>
                <Bar data={data_perturbations} options={createOptions("Tests by Criteria")}> </Bar>
            </div>
            <div className={'w-full h-[20%]'}>
                <Options onPerturbationChange={setSelectedPerturbation}/>
                <Bar data={data_acceptable} options={
                    createOptions(`Acceptable Tests by ${selectedPerturbation[0].toUpperCase() + selectedPerturbation.slice(1).toLowerCase()}`)}> </Bar>
            </div>
        </div>
    )
}

export default TaskGraph;
