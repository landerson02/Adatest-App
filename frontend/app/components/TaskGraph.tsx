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

type taskGraphProps = {
    isPerturbed: boolean,
}
const TaskGraph = ({isPerturbed}: taskGraphProps) => {
    const {testData} = useContext(TestDataContext);
    // Currently selected Perturbation from the filter used in the last graph
    const [selectedPerturbation, setSelectedPerturbation] = useState<string>('spelling'); // New state
    const [topicData, setTopicData] = useState<any>({}); // New state
    const [pertData, setPertData] = useState<any>({}); // New state
    const [criteriaData, setCriteriaData] = useState<any>({}); // New state
    const [totalTests, setTotalTests] = useState<number>(0); // New state
    
    const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE);
    const decisionValidity = ['approved', 'denied'];
    const topicTypes = ['PE', 'KE', 'LCE'];
    
    // Use effect that updates topic data when testData.tests are updated -> sets data for topic graph
    useEffect(() => {
        async function fetchTests() {
            let tests: any = {};
            decisionValidity.forEach(validity => {
                tests[validity] = {};
                topicTypes.forEach(type => {
                    tests[validity][type] = tests.filter((test: testType) => test.topic === type && test.validity === validity);
                });
            });
            setTopicData(tests);
        }
        fetchTests();
    }, [testData.tests, setTopicData]);

    // Sets the data for the tests that are graded by topic
    const data_topic = {
        labels: topicTypes,
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [topicData[decisionValidity[0]][topicTypes[0]].length, topicData[decisionValidity[0]][topicTypes[1]].length,
                topicData[decisionValidity[0]][topicTypes[2]].length],
            backgroundColor: '#52C41A'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [topicData[decisionValidity[1]][topicTypes[0]].length, topicData[decisionValidity[1]][topicTypes[1]].length,
                topicData[decisionValidity[1]][topicTypes[2]].length],
            backgroundColor: '#FF4D4F'
        }]
    };

    // useEffect that updates pertData when testData.tests are updated -> sets data for perturbation graph
    const decisionTypes = ['Base', 'Spelling', 'Negation', 'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish'];
    useEffect(() => {
        async function fetchPerts() {
            const perts: any = {};
            decisionValidity.forEach(validity => {
                perts[validity] = {};
                decisionTypes.forEach(type => {
                    if(type === 'Base') {
                        perts[validity][type] = tests.filter((test: testType) => test.validity === validity);
                    }
                    perts[validity][type] = testData.pert_decisions[validity].filter((pert: any) => pert.type.toLowerCase() === type.toLowerCase());
                });
            });
            setPertData(perts);
        }
        fetchPerts();
    }, [testData, setPertData, pertData]);
    // Sets the data for the graph for all the perturbations graded by type

    const data_perturbations = {
        labels: decisionTypes,
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [pertData[decisionValidity[0]][decisionTypes[0]], pertData[decisionValidity[0]][decisionTypes[1]].length, pertData[decisionValidity[0]][decisionTypes[2]].length,
                pertData[decisionValidity[0]][decisionTypes[3]].length, pertData[decisionValidity[0]][decisionTypes[4]].length,
                pertData[decisionValidity[0]][decisionTypes[5]].length, pertData[decisionValidity[0]][decisionTypes[6]].length],
            backgroundColor: '#52C41A'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [pertData[decisionValidity[1]][decisionTypes[0]], pertData[decisionValidity[1]][decisionTypes[1]].length,
                pertData[decisionValidity[1]][decisionTypes[2]].length, pertData[decisionValidity[1]][decisionTypes[3]].length,
                pertData[decisionValidity[1]][decisionTypes[4]].length, pertData[decisionValidity[1]][decisionTypes[5]].length,
                pertData[decisionValidity[1]][decisionTypes[6]].length],
            backgroundColor: '#FF4D4F'
        }]
    };

    // Sets the data needed for the graphs in criteria_data based on selected perturbation
    const decisionLabels = ['acceptable', 'unacceptable'];
    const criteria_data: any = {};
        decisionValidity.forEach(validity => {
            criteria_data[validity] = {};
            decisionLabels.forEach(label => {
                if(selectedPerturbation === 'base') {
                    criteria_data[validity][label] = tests.filter((test: testType) =>
                        test.validity.toLowerCase() === validity && test.label.toLowerCase() === label
                    );
                } else {
                     criteria_data[validity][label] = testData.pert_decisions[validity].filter((pert: any) =>
                    pert.label.toLowerCase() === label.toLowerCase() && pert.type.toLowerCase() === selectedPerturbation.toLowerCase());
                }
        });
    });

    const data_criteria = {
        labels: ['Acceptable', 'Unacceptable'],
        datasets: [{
            label: 'Matching Your Evaluation',
            data: [criteria_data[decisionValidity[0]][decisionLabels[0]].length,
                criteria_data[decisionValidity[0]][decisionLabels[1]].length],
            backgroundColor: '#52C41A'
        },
        {
            label: 'Not Matching Your Evaluation',
            data: [criteria_data[decisionValidity[1]][decisionLabels[0]].length,
                criteria_data[decisionValidity[1]][decisionLabels[1]].length],
            backgroundColor: '#FF4D4F'
        }]
    };

    // fixing type error for options
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
        borderRadius: 5,
    });

    return (
        <div className={'float-end overflow-auto w-full h-full justify-start items-center flex flex-col'}>
            <div className={'w-full h-[15]%'}>
                <div className={'bg-gray-100 w-full h-[25%] justify-center items-center flex border-b border-gray-200'}>
                    <h1 className={'align-middle text-2xl font-normal text-gray-600'}> Visualization </h1>
                </div>
                <Options onPerturbationChange={setSelectedPerturbation}/>
                <div className={'justify-center mt-7 float-start w-full'}>
                    <p> Graded Essays in Total </p>
                    <p className={'text-4xl font-serif'}> {totalTests} </p>
                </div>
            </div>
            <div className={'w-full h-52'}>
                <Bar data={data_topic} options={createOptions("Tests by Topic")}> </Bar>
            </div>
            <div className={'w-full h-44'}>
                <Bar data={data_criteria} options={
                    createOptions(`Tests by Grade: ${selectedPerturbation[0].toUpperCase() + selectedPerturbation.slice(1).toLowerCase()}`)}> </Bar>
            </div>
            <div className={'w-full h-96'}>
                <Bar data={data_perturbations} options={createOptions("Tests by Criteria")}> </Bar>
            </div>
        </div>
    )
}

export default TaskGraph;
