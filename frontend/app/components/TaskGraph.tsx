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
    const [topicData, setTopicData] = useState<ChartData <'bar', {value: number} []>>();
    const [topics, setTopics] = useState<graphDataType>();

    const [criteriaData, setCriteriaData] = useState<ChartData <'bar', {key: string, value: number} []>>();
    const [criteria, setCriteria] = useState<graphDataType>();

    const [grades, setGrades] = useState<graphDataType>();
    const [gradeData, setGradeData] = useState<ChartData <'bar', {key: string, value: number} []>>();
    const [totalTests, setTotalTests] = useState<number>(0);

    // Arrays to store labels to be used in graphs
    const validityLabels = ['approved', 'denied'];
    const topicLabels = ['PE', 'KE', 'LCE', 'CU0', 'CU5'];
    const criteriaLabels = ['Base', 'Spelling', 'Negation', 'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish'];
    const gradeLabels = ['acceptable', 'unacceptable'];

    // Use effect that updates topic data when testData.tests are updated -> sets data for topic
    useEffect(() => {
        const tests = testData.tests.PE.concat(testData.tests.KE, testData.tests.LCE, testData.tests.CU0, testData.tests.CU5);
        // Filters through tests -> outputs them to categorize by label and topic
        function fetchTests() {
            let temp : graphDataType= {}
            validityLabels.forEach(validity => { // in this array, array[0] = acceptable, array[1] = unacceptable
                temp[validity] = {};
                topicLabels.forEach(topic => { // in this array, array[0][0] = acceptable and PE, and so on for that list
                    temp[validity][topic] = tests.filter((test: testType) =>
                        test.topic.toLowerCase() === topic.toLowerCase() && test.validity.toLowerCase() === validity.toLowerCase());
                });
            });
            setTopics(temp);
        }
        function fetchCriteria() {
            let temp: graphDataType = {};
            validityLabels.forEach(validity => {
                temp[validity] = {};
                criteriaLabels.forEach(type => {
                    if(type === 'Base') {
                       temp[validity][type] = tests.filter((test: testType) => test.validity === validity);
                    }
                    temp[validity][type] = testData.pert_decisions[validity].filter((pert: any) => pert.type.toLowerCase() === type.toLowerCase());
                });
            });
            setCriteria(temp);
        }

        function fetchGrade() {
            let temp: graphDataType = {};
            validityLabels.forEach(validity => {
                temp[validity] = {};
                gradeLabels.forEach(label => {
                    if(selectedPerturbation === 'base') {
                        temp[validity][label] = tests.filter((test: testType) =>
                            test.validity.toLowerCase() === validity && test.label.toLowerCase() === label
                        );
                    } else {
                        temp[validity][label] = testData.pert_decisions[validity].filter((pert: any) =>
                        pert.label.toLowerCase() === label.toLowerCase() && pert.type.toLowerCase() === selectedPerturbation.toLowerCase());
                    }
                });
            });
            setGrades(temp);
        }
        setIsLoading(true);
        // Runs the fetch tests fn above when loading,
        fetchTests();
        fetchCriteria();
        fetchGrade();
        console.log(topics);
        console.log(criteria);
        console.log(grades);
        setIsLoading(false);
    }, [testData.tests]);

    // useEffect that updates pertData when testData.tests are updated -> sets data for perturbation graph
    useEffect(() => {
        // Sets the data for the tests that are graded by topic
        if (topics) {
            const tData: ChartData<'bar', {value: number} []> = {
                labels: topicLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    // keys: ['PE', 'KE', 'LCE', 'CU0', 'CU5']
                    data: [{value: topics[validityLabels[0]][topicLabels[0]].length},
                        {value: topics[validityLabels[0]][topicLabels[1]].length},
                        {value: topics[validityLabels[0]][topicLabels[2]].length},
                        {value: topics[validityLabels[0]][topicLabels[3]].length},
                        {value: topics[validityLabels[0]][topicLabels[4]].length}],
                    parsing: {
                        xAxisKey: 'key',
                        yAxisKey: 'value'
                    },
                    backgroundColor: '#52C41A'
                    },
                    {
                        label: 'Not Matching Your Evaluation',
                        data: [{value: topics[validityLabels[1]][topicLabels[0]].length},
                            {value: topics[validityLabels[1]][topicLabels[1]].length},
                            {value: topics[validityLabels[1]][topicLabels[2]].length},
                            {value: topics[validityLabels[1]][topicLabels[3]].length},
                            {value: topics[validityLabels[1]][topicLabels[4]].length}],
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
            const cData: ChartData<'bar', { key: string, value: number } []> = {
                labels: criteriaLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: [{key: criteriaLabels[0], value: criteria[validityLabels[0]][criteriaLabels[0]].length},
                        {key: criteriaLabels[1], value: criteria[validityLabels[0]][criteriaLabels[1]].length},
                        {key: criteriaLabels[2], value: criteria[validityLabels[0]][criteriaLabels[2]].length},
                        {key: criteriaLabels[3], value: criteria[validityLabels[0]][criteriaLabels[3]].length},
                        {key: criteriaLabels[4], value: criteria[validityLabels[0]][criteriaLabels[4]].length},
                        {key: criteriaLabels[5], value: criteria[validityLabels[0]][criteriaLabels[5]].length},
                        {key: criteriaLabels[6], value: criteria[validityLabels[0]][criteriaLabels[6]].length}],
                    parsing: {
                        xAxisKey: 'key',
                        yAxisKey: 'value’3'
                    },
                    backgroundColor: '#52C41A'
                },
                    {
                        label: 'Not Matching Your Evaluation',
                        data: [{key: criteriaLabels[0], value: criteria[validityLabels[1]][criteriaLabels[0]].length},
                            {key: criteriaLabels[1], value: criteria[validityLabels[1]][criteriaLabels[1]].length},
                            {key: criteriaLabels[2], value: criteria[validityLabels[1]][criteriaLabels[2]].length},
                            {key: criteriaLabels[3], value: criteria[validityLabels[1]][criteriaLabels[3]].length},
                            {key: criteriaLabels[4], value: criteria[validityLabels[1]][criteriaLabels[4]].length},
                            {key: criteriaLabels[5], value: criteria[validityLabels[1]][criteriaLabels[5]].length},
                            {key: criteriaLabels[6], value: criteria[validityLabels[1]][criteriaLabels[6]].length}],
                        parsing: {
                            xAxisKey: 'key',
                            yAxisKey: 'value'
                        },
                        backgroundColor: '#FF4D4F'
                    }]
            };
            // Sets the data for the tests that are graded by topic
            setCriteriaData(cData);
        }

        if (grades) {
            const gData: ChartData<'bar', { key: string, value: number } []> = {
                labels: gradeLabels,
                datasets: [{
                    label: 'Matching Your Evaluation',
                    data: [{key: validityLabels[0], value: grades[validityLabels[0]][gradeLabels[0]].length},
                        {key: validityLabels[0], value: grades[validityLabels[0]][gradeLabels[1]].length}],
                    backgroundColor: '#52C41A'
                }, {
                    label: 'Not Matching Your Evaluation',
                    data: [{key: validityLabels[1], value: grades[validityLabels[1]][gradeLabels[0]].length},
                        {key: validityLabels[1], value: grades[validityLabels[1]][gradeLabels[1]].length}],
                    backgroundColor: '#FF4D4F'
                }]
            } || undefined;
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

    return (
        <div className={'float-end overflow-auto w-full h-full justify-start items-center flex flex-col'}>
            <div className={'w-full h-[15]%'}>
                <div className={'bg-gray-100 w-full h-[25%] justify-center items-center flex border-b border-gray-200'}>
                    <h1 className={'align-middle text-2xl font-normal text-gray-600'}> Visualization </h1>
                </div>
                {isPerturbed && <Options onPerturbationChange={setSelectedPerturbation}/>}
                <div className={'justify-center mt-7 float-start w-full'}>
                    <p> Graded Essays in Total </p>
                    <p className={'text-4xl font-serif'}> {totalTests} </p>
                </div>
            </div>
            <div className={'w-full h-52'}>
                {topicData && <Bar data={topicData} options={createOptions("Tests by Topic")}> </Bar>}
            </div>
            <div className={'w-full h-96'}>
                {gradeData && <Bar data={gradeData} options={createOptions("Tests by Criteria")}> </Bar>}
            </div>
            <div className={'w-full h-44'}>
                {criteriaData && isPerturbed && <Bar data={criteriaData} options=
                    {createOptions(`Tests by Grade: ${selectedPerturbation[0].toUpperCase() + selectedPerturbation.slice(1).toLowerCase()}`)}> </Bar>}
            </div>
        </div>
    )
}

export default TaskGraph;
