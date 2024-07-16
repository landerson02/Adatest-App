'use client';
import React, { useContext, useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { TestDataContext } from "@/lib/TestContext";
import { graphDataType } from "@/lib/Types";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
    ChartData,
} from 'chart.js';
import Options from "@/app/components/Options";
import { hasPerturbed } from "@/lib/utils";

ChartJS.register(BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title);

const TaskGraph = () => {
    const { testData, isCurrent } = useContext(TestDataContext);

    // Boolean to check if the graph is loaded
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // States for the dropdown
    const [criteriaLabelsDropdown, setCriteriaLabelsDropdown] = useState<string[]>([]);
    const [selectedCriteria, setSelectedCriteria] = useState<string>('base');

    // States for the graph data/options
    const [topicChartOptions, setTopicChartOptions] = useState<ChartData<'bar', number[]>>();
    const [criteriaChartOptions, setCriteriaChartOptions] = useState<ChartData<'bar', number[]>>();
    const [gradeChartOptions, setGradeChartOptions] = useState<ChartData<'bar', number[]>>();

    // Total number of (approved and denied) tests
    const [totalTests, setTotalTests] = useState<number>(0);

    // Boolean to check if the user has perturbed any tests
    const [isPerturbed, setIsPerturbed] = useState(hasPerturbed(testData));

    // Use effect that updates topic data when testData.tests are updated -> sets graph data
    useEffect(() => {
        setIsPerturbed(hasPerturbed(testData));
        if (!isCurrent) {
            return;
        }
        setIsLoaded(false);

        // Set total tests
        const total = Object.values(testData.test_decisions).reduce((sum, decision) => sum + decision.approved.length + decision.denied.length, 0);
        setTotalTests(total);

        // Set topic labels
        const topicLabels = Object.keys(testData.test_decisions);
        // Set topic data
        const topicData = createTopicData(topicLabels);

        // Set grade labels
        const gradeLabels = ['Acceptable', 'Unacceptable'];
        // Set grade data
        const gradeData = createGradeData(gradeLabels);

        // Set criteria labels
        const pertTests = testData.pert_decisions.approved.concat(testData.pert_decisions.denied);
        const criteriaLabels = Array.from(new Set(pertTests.map(test => test.type)));
        criteriaLabels.unshift('base');
        setCriteriaLabelsDropdown(criteriaLabels);
        // Set criteria data
        const criteriaData = createCriteriaData(criteriaLabels, topicLabels);

        // Set chart options
        const options = createChartOptions(topicLabels, topicData, gradeLabels, gradeData, criteriaLabels, criteriaData);
        setTopicChartOptions(options.topicChartOptions);
        setGradeChartOptions(options.gradeChartOptions);
        setCriteriaChartOptions(options.criteriaChartOptions);

        setIsLoaded(true);
    }, [isCurrent, selectedCriteria, testData.tests]);

    /**
     * Create data for the topic graph
     * @param topicLabels list of topics
     * @returns graph data {approved: number[], denied: number[]}, where each index corresponds to the index in topicLabels
     */
    const createTopicData = (topicLabels: string[]) => {
        const topicData: graphDataType = { approved: [], denied: [] };
        if (selectedCriteria === 'base') {
            topicLabels.forEach(topic => {
                topicData.approved.push(testData.test_decisions[topic]["approved"].length);
                topicData.denied.push(testData.test_decisions[topic]["denied"].length);
            });
        } else {
            topicLabels.forEach(topic => {
                const pertApproveTests = testData.pert_decisions["approved"].filter((pert) => pert.topic.toLowerCase() === topic.toLowerCase());
                topicData.approved.push(pertApproveTests.filter((pert: any) => pert.type.toLowerCase() === selectedCriteria.toLowerCase()).length);

                const pertDenyTests = testData.pert_decisions["denied"].filter((pert) => pert.topic.toLowerCase() === topic.toLowerCase());
                topicData.denied.push(pertDenyTests.filter((pert: any) => pert.type.toLowerCase() === selectedCriteria.toLowerCase()).length);
            });
        }
        return topicData;
    }

    /**
     * Create data for the grade graph
     * @param gradeLabels list of grades
     * @returns graph data {approved: number[], denied: number[]}, where each index corresponds to the index in gradeLabels
     */
    const createGradeData = (gradeLabels: string[]) => {
        const gradeData: graphDataType = { approved: [], denied: [] };
        if (selectedCriteria === 'base') {
            const approvedTests = Object.values(testData.test_decisions).flatMap(decision => decision["approved"]);
            const deniedTests = Object.values(testData.test_decisions).flatMap(decision => decision["denied"]);
            gradeLabels.forEach(grade => {
                gradeData.approved.push(approvedTests.filter((test) => test.ground_truth.toLowerCase() === grade.toLowerCase()).length);
                gradeData.denied.push(deniedTests.filter((test) => test.ground_truth.toLowerCase() === grade.toLowerCase()).length);
            });
        } else {
            const approvedTests = testData.pert_decisions["approved"];
            const deniedTests = testData.pert_decisions["denied"];
            gradeLabels.forEach(grade => {
                gradeData.approved.push(approvedTests.filter((pert: any) => pert.ground_truth.toLowerCase() === grade.toLowerCase() && pert.type.toLowerCase() === selectedCriteria.toLowerCase()).length);
                gradeData.denied.push(deniedTests.filter((pert: any) => pert.ground_truth.toLowerCase() === grade.toLowerCase() && pert.type.toLowerCase() === selectedCriteria.toLowerCase()).length);
            });
        }
        return gradeData;
    }

    /**
     * Create data for the criteria graph
     * @param criteriaLabels list of criteria
     * @param topicLabels list of topics
     * @returns graph data {approved: number[], denied: number[]}, where each index corresponds to the index in criteriaLabels
     */
    const createCriteriaData = (criteriaLabels: string[], topicLabels: string[]) => {
        const criteriaData: graphDataType = { approved: [], denied: [] };
        criteriaLabels.forEach(criteria => {
            if (criteria === 'base') {
                let approveSum = 0;
                let denySum = 0;
                topicLabels.forEach(topic => {
                    approveSum += testData.test_decisions[topic]["approved"].length;
                    denySum += testData.test_decisions[topic]["denied"].length;
                });
                criteriaData.approved.push(approveSum);
                criteriaData.denied.push(denySum);
            } else {
                criteriaData.approved.push(testData.pert_decisions.approved.filter((pert) => pert.type.toLowerCase() === criteria.toLowerCase()).length);
                criteriaData.denied.push(testData.pert_decisions.denied.filter((pert) => pert.type.toLowerCase() === criteria.toLowerCase()).length);
            }
        });
        return criteriaData;
    }

    /**
     * Create chart options for the topic, grade, and criteria graphs
     * @param topicLabels list of topics
     * @param topicData graph data for topics
     * @param gradeLabels list of grades
     * @param gradeData graph data for grades
     * @param criteriaLabels list of criteria
     * @param criteriaData graph data for criteria
     * @returns chart options for the topic, grade, and criteria graphs {topicChartOptions, gradeChartOptions, criteriaChartOptions}
     */
    const createChartOptions = (topicLabels: string[], topicData: graphDataType, gradeLabels: string[], gradeData: graphDataType, criteriaLabels: string[], criteriaData: graphDataType) => {
        topicLabels.forEach((topic, index) => {
            if (topic == 'CU0') topicLabels[index] = 'Height/PE';
            if (topic == 'CU5') topicLabels[index] = 'Mass/Energy';
        });
        const topicChartOptions: ChartData<'bar', number[]> = {
            labels: topicLabels,
            datasets: [{
                label: 'Matching Your Evaluation',
                data: topicData.approved,
                backgroundColor: '#52C41A'
            },
            {
                label: 'Not Matching Your Evaluation',
                data: topicData.denied,
                parsing: {
                    xAxisKey: 'key',
                    yAxisKey: 'value'
                },
                backgroundColor: '#FF4D4F'
            }]
        };

        const gradeChartOptions: ChartData<'bar', number[]> = {
            labels: gradeLabels,
            datasets: [{
                label: 'Matching Your Evaluation',
                data: gradeData.approved,
                backgroundColor: '#52C41A'
            }, {
                label: 'Not Matching Your Evaluation',
                data: gradeData.denied,
                backgroundColor: '#FF4D4F'
            }]
        };

        const criteriaChartOptions: ChartData<'bar', number[]> = {
            labels: criteriaLabels,
            datasets: [{
                label: 'Matching Your Evaluation',
                data: criteriaData.approved,
                backgroundColor: '#52C41A'
            },
            {
                label: 'Not Matching Your Evaluation',
                data: criteriaData.denied,
                backgroundColor: '#FF4D4F'
            }]
        };

        return { topicChartOptions, gradeChartOptions, criteriaChartOptions };
    }

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
                afterFit: function(axis: any) {
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
        <div className={'overflow-y-scroll h-full w-full justify-start items-center flex flex-col'}>
            <div className={'w-full h-22'}>
                <div className={'bg-gray-100 w-full h-[25%] justify-center items-center flex border-b border-gray-200'}>
                    <h1 className={'align-middle text-2xl font-normal text-gray-600'}>Where AI Fails</h1>
                </div>
                <div className={'justify-center mt-7 float-start w-full'}>
                    <p>Statements Evaluated in Total</p>
                    <p className={'text-4xl font-serif'}> {totalTests} </p>
                </div>
                {isPerturbed && isLoaded && <Options onPerturbationChange={setSelectedCriteria} criteriaLabels={criteriaLabelsDropdown} />}
            </div>
            {isLoaded && <div className={'w-full h-72'}>
                {/*@ts-ignore*/}
                {topicChartOptions && <Bar data={topicChartOptions} options={createOptions('Tests by Topic')}> </Bar>}
            </div>}
            {isLoaded && <div className={'w-full h-44'}>
                {/*@ts-ignore*/}
                {gradeChartOptions && <Bar data={gradeChartOptions} options={createOptions('Tests by Grade')}> </Bar>}
            </div>}
            {isLoaded && <div className={'w-full h-96'}>
                {isPerturbed && criteriaChartOptions &&
                    //@ts-ignore
                    <Bar data={criteriaChartOptions} options={createOptions("Tests by Criteria")}> </Bar>}
            </div>}
        </div>
    )
}

export default TaskGraph;
