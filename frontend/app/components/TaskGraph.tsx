'use client';
import React, {useContext, useEffect, useState} from "react";
import { Bar } from 'react-chartjs-2';
import { TestDataContext } from "@/lib/TestContext";
import {graphDataType} from "@/lib/Types";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    ChartData
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
    const [selectedPerturbation, setSelectedPerturbation] = useState<string>('base');
    // Holds data for all the tests graded by topic
    const [isLoading, setIsLoading] = useState(true);

    // Use States to handle the data for the charts - topic, criteria (perturbation), and grade (acceptable vs unacceptable)
    const [topicData, setTopicData] = useState();
    const [criteriaData, setPertData] = useState();
    const [gradeData, setCriteriaData] = useState();
    const [totalTests, setTotalTests] = useState<number>(0);

    // Arrays to store labels to be used in graphs
    const validityLabels = ['approved', 'denied'];
    const topicLabels = ['PE', 'KE', 'LCE', 'CU0', 'CU5'];
    const criteriaLabels = ['Base', 'Spelling', 'Negation', 'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish'];
    const gradeLabels = ['acceptable', 'unacceptable'];

    // Use effect that updates topic data when testData.tests are updated -> sets data for topic
    useEffect(() => {
        const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE, testData.tests.CU0, testData.tests.CU5);
        let topics : graphDataType= {}
        // Filters through tests -> outputs them to categorize by label and topic
        async function fetchTests() {
            validityLabels.forEach(validity => { // in this array, array[0] = acceptable, array[1] = unacceptable
                topics[validity] = {};
                topicLabels.forEach(type => { // in this array, array[0][0] = acceptable and PE, and so on for that list
                    topics[validity][type] = tests.filter((test: testType) => test.topic === type && test.validity === validity);
                });
            });
        }
        setIsLoading(true);
        // Runs the fetch tests fn above when loading,
        fetchTests().then(() => {
            console.log(topics);
            // Sets the data for the tests that are graded by topic
            
            setTopicData({
                labels: topicLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: [topics[validityLabels[0]][topicLabels[0]].length, topics[validityLabels[0]][topicLabels[1]].length,
                        topics[validityLabels[0]][topicLabels[2]].length],
                    backgroundColor: '#52C41A'
                },
                {
                    label: 'Not Matching Your Evaluation',
                    data: [topics[validityLabels[1]][topicLabels[0]].length, topics[validityLabels[1]][topicLabels[1]].length,
                        topics[validityLabels[1]][topicLabels[2]].length],
                    backgroundColor: '#FF4D4F'
                }]
            });
            setIsLoading(false);
        });
    }, [testData.tests]);

    // useEffect that updates pertData when testData.tests are updated -> sets data for perturbation graph
    useEffect(() => {
        const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE);
        let perts: graphDataType = {};
        async function fetchPerts() {
            validityLabels.forEach(validity => {
                perts[validity] = {};
                criteriaLabels.forEach(type => {
                    if(type === 'Base') {
                        perts[validity][type] = tests.filter((test: testType) => test.validity === validity);
                    }
                    perts[validity][type] = testData.pert_decisions[validity].filter((pert: any) => pert.type.toLowerCase() === type.toLowerCase());
                });
            });
        }
        setIsLoading(true);
        fetchPerts().then(() => {
           // Sets the data for the tests that are graded by topic
            setDataPert({
                labels: criteriaLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: [perts[validityLabels[0]][criteriaLabels[0]].length, perts[validityLabels[0]][criteriaLabels[1]].length, perts[validityLabels[0]][criteriaLabels[2]].length,
                        perts[validityLabels[0]][criteriaLabels[3]].length, perts[validityLabels[0]][criteriaLabels[4]].length,
                        perts[validityLabels[0]][criteriaLabels[5]].length, perts[validityLabels[0]][criteriaLabels[6]].length],
                    backgroundColor: '#52C41A'
                },
                {
                    label: 'Not Matching Your Evaluation',
                    data: [perts[validityLabels[1]][criteriaLabels[0]].length, perts[validityLabels[1]][criteriaLabels[1]].length,
                        perts[validityLabels[1]][criteriaLabels[2]].length, perts[validityLabels[1]][criteriaLabels[3]].length,
                        perts[validityLabels[1]][criteriaLabels[4]].length, perts[validityLabels[1]][criteriaLabels[5]].length,
                        perts[validityLabels[1]][criteriaLabels[6]].length],
                    backgroundColor: '#FF4D4F'
                }]
            });
            setIsLoading(false);
        });
    }, [testData]);

    // useEffect that updates pertData when testData.tests are updated -> sets data for perturbation graph
    useEffect(() => {
        const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE);
        let criterias: graphDataType = {};
        async function fetchCrits() {
            validityLabels.forEach(validity => {
                criterias[validity] = {};
                gradeLabels.forEach(label => {
                    if(selectedPerturbation === 'base') {
                        criterias[validity][label] = tests.filter((test: testType) =>
                            test.validity.toLowerCase() === validity && test.label.toLowerCase() === label
                        );
                    } else {
                         criterias[validity][label] = testData.pert_decisions[validity].filter((pert: any) =>
                        pert.label.toLowerCase() === label.toLowerCase() && pert.type.toLowerCase() === selectedPerturbation.toLowerCase());
                    }
                });
            });
        }
        setIsLoading(true);
        fetchCrits().then(() => {
           // Sets the data for the tests that are graded by topic
            setDataCriteria({
            labels: ['Acceptable', 'Unacceptable'],
            datasets: [{
                label: 'Matching Your Evaluation',
                data: [criterias[validityLabels[0]][gradeLabels[0]].length,
                        criterias[validityLabels[0]][gradeLabels[1]].length],
                backgroundColor: '#52C41A'
                }, {
                label: 'Not Matching Your Evaluation',
                data: [criterias[validityLabels[1]][gradeLabels[0]].length,
                    criterias[validityLabels[1]][gradeLabels[1]].length],
                backgroundColor: '#FF4D4F'
                }]
            });
            setIsLoading(false);
        });
        }, [testData]);
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
                <Bar data={dataTopic} options={createOptions("Tests by Topic")}> </Bar>
            </div>
            <div className={'w-full h-44'}>
                <Bar data={dataCriteria} options={
                    createOptions(`Tests by Grade: ${selectedPerturbation[0].toUpperCase() + selectedPerturbation.slice(1).toLowerCase()}`)}> </Bar>
            </div>
            <div className={'w-full h-96'}>
                <Bar data={dataPert} options={createOptions("Tests by Criteria")}> </Bar>
            </div>
        </div>
    )
}

export default TaskGraph;
