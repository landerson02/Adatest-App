import Histogram from "@/app/components/Histogram";

const TaskGraph = () => {
    return (
        <div className={'border-r-2 border-gray-600 w-1/2 justify-center items-center flex flex-col'}>
            <h1>Task Graph</h1>
            <Histogram />
        </div>
    )
}

export default TaskGraph;
