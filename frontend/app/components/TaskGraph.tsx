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
    criteriaLabels: string[],
}
const TaskGraph = ({isPerturbed, criteriaLabels}: taskGraphProps) => {
    const {testData} = useContext(TestDataContext);

    // Currently selected Perturbation from the filter used in the last graph
    const [selectedPerturbation, setSelectedPerturbation] = useState<string>('base');
    // Holds data for all the tests graded by topic
    const [isLoading, setIsLoading] = useState(true);


    // Use States to handle the data for the charts - topic, criteria (perturbation), and grade (acceptable vs unacceptable)
    const [topicData, setTopicData] = useState<ChartData <'bar', number []>>();
    const [topics, setTopics] = useState<graphDataType>();

    const [criteriaData, setCriteriaData] = useState<ChartData <'bar', number []>>();
    const [criteria, setCriteria] = useState<graphDataType>();

    const [grades, setGrades] = useState<graphDataType>();
    const [gradeData, setGradeData] = useState<ChartData <'bar', number []>>();
    const [totalTests, setTotalTests] = useState<number>(0);

    // Arrays to store labels to be used in graphs
    const validityLabels = ['approved', 'denied'];
    const topicLabels = ['CU0', 'CU5'];
    const gradeLabels = ['Acceptable', 'Unacceptable'];

    // Use effect that updates topic data when testData.tests are updated -> sets data for topic
    useEffect(() => {
        const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE, testData.tests.CU0, testData.tests.CU5);
        const total = tests.filter((test: testType) => test.validity.toLowerCase() === 'approved' || test.validity.toLowerCase() === 'denied').length;
        setTotalTests(total);
        // Filters through tests -> outputs them to categorize by label and topic
        function fetchTests() {
            let temp : graphDataType= {}
            validityLabels.forEach(validity => { // in this array, array[0] = approved, array[1] = denied
                temp[validity] = {};
                topicLabels.forEach(topic => { // in this array, array[0][0] = approved and PE, and so on for that list
                    if(selectedPerturbation === 'base') {
                        temp[validity][topic] = tests.filter((test: testType) =>
                            test.topic.toLowerCase() === topic.toLowerCase() && test.validity.toLowerCase() === validity.toLowerCase());
                    } else {
                        temp[validity][topic] = testData.pert_decisions[validity].filter((pert: any) =>
                            pert.type.toLowerCase() === selectedPerturbation.toLowerCase() &&
                            testData.tests[topic].some(test => test.id === pert.test_parent));
                    }
                });
            });
            setTopics(temp);
        }

        function fetchGrade() {
            let temp: graphDataType = {};
            validityLabels.forEach(validity => {
                temp[validity] = {};
                gradeLabels.forEach(grade => {
                    if(selectedPerturbation === 'base') {
                        temp[validity][grade] = tests.filter((test: testType) =>
                            test.validity.toLowerCase() === validity && test.ground_truth.toLowerCase() === grade.toLowerCase()
                        );
                    } else {
                        temp[validity][grade] = testData.pert_decisions[validity].filter((pert: any) =>
                        pert.ground_truth.toLowerCase() === grade.toLowerCase() && pert.type.toLowerCase() === selectedPerturbation.toLowerCase());
                    }
                });
            });
            setGrades(temp);
        }

        function fetchCriteria() {
            let temp: graphDataType = {};
            validityLabels.forEach(validity => { // in this array, array[0] = approved, array[1] = denied
                temp[validity] = {};
                console.log("At Fetch Criteria: " + criteriaLabels);
                criteriaLabels.forEach(criteria => { // in this array, array[0][0] = approved and Base, and so on for that list
                    if(criteria === criteriaLabels[0]) {
                       temp[validity][criteria] = tests.filter((test: testType) => test.validity.toLowerCase() === validity.toLowerCase());
                    } else {
                       temp[validity][criteria] = testData.pert_decisions[validity].filter((pert: any) => pert.type.toLowerCase() === criteria.toLowerCase());
                    }
                });
            });
            setCriteria(temp);
        }
        setIsLoading(true);
        // Runs the fetch tests fn above when loading,
        fetchTests();
        fetchCriteria();
        fetchGrade();
        setIsLoading(false);
    }, [testData, selectedPerturbation, criteriaLabels]);

    // useEffect that updates pertData when testData.tests are updated -> sets data for perturbation graph
    useEffect(() => {
        // Sets the data for the tests that are graded by topic
        if (topics) {
            const tData: ChartData<'bar', number []> = {
                labels: ['Height/PE', 'Mass/Energy'],
                datasets: [{
                    label: 'Matching Your Evaluation',
                    // keys: ['CU0', 'CU5']
                    data: [topics[validityLabels[0]][topicLabels[0]].length,
                        topics[validityLabels[0]][topicLabels[1]].length],
                    backgroundColor: '#52C41A'
                    },
                {
                    label: 'Not Matching Your Evaluation',
                    data: [topics[validityLabels[1]][topicLabels[0]].length,
                        topics[validityLabels[1]][topicLabels[1]].length],
                    parsing: {
                        xAxisKey: 'key',
                        yAxisKey: 'value'
                    },
                    backgroundColor: '#FF4D4F'
                }]
            };
            setTopicData(tData);
        }
        if (criteria) {
            let matchList = [];
            let unmatchList = [];
            console.log("At setting data: " + criteriaLabels);
            console.log(criteria);
            for(let i = 0; i < criteriaLabels.length; i++) {
                matchList.push(criteria[validityLabels[0]][criteriaLabels[i]].length);
                unmatchList.push(criteria[validityLabels[1]][criteriaLabels[i]].length);
            }
            const cData: ChartData<'bar', number []> = {
                labels: criteriaLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: matchList,
                    backgroundColor: '#52C41A'
                },
                {
                    label: 'Not Matching Your Evaluation',
                    data: unmatchList,
                    backgroundColor: '#FF4D4F'
                }]
            };
            // Sets the data for the tests that are graded by topic
            setCriteriaData(cData);
        }

        if (grades) {
            const gData: ChartData<'bar', number []> = {
                labels: gradeLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: [grades[validityLabels[0]][gradeLabels[0]].length,
                       grades[validityLabels[0]][gradeLabels[1]].length],
                    backgroundColor: '#52C41A'
                }, {
                    label: 'Not Matching Your Evaluation',
                    data: [grades[validityLabels[1]][gradeLabels[0]].length,
                        grades[validityLabels[1]][gradeLabels[1]].length],
                    backgroundColor: '#FF4D4F'
                }]
            };
            setGradeData(gData);
        }
    }, [topics, grades, criteria]);

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

    // @ts-ignore
    return (
        <div className={'float-end overflow-auto w-full h-full justify-start items-center flex flex-col'}>
            <div className={'w-full h-[15]%'}>
                <div className={'bg-gray-100 w-full h-[25%] justify-center items-center flex border-b border-gray-200'}>
                    <h1 className={'align-middle text-2xl font-normal text-gray-600'}> Visualization </h1>
                </div>
                <div className={'justify-center mt-7 float-start w-full'}>
                    <p> Graded Essays in Total </p>
                    <p className={'text-4xl font-serif'}> {totalTests} </p>
                </div>
                {isPerturbed && <Options onPerturbationChange={setSelectedPerturbation} criteriaLabels={criteriaLabels}/>}
            </div>
            <div className={'w-full h-44'}>
                {topicData && <Bar data={topicData} options={createOptions('Tests by Topic')}> </Bar>}
            </div>
            <div className={'w-full h-44'}>
                {gradeData && <Bar data={gradeData} options={createOptions('Tests by Grade')}> </Bar>}
            </div>
            <div className={'w-full h-96'}>
                {isPerturbed && criteriaData &&
                    <Bar data={criteriaData} options={createOptions("Tests by Criteria")}> </Bar>}
            </div>
        </div>
    )
}

export default TaskGraph;
