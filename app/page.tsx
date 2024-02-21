import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center p-1">
      <div className={'flex justify-between w-full h-60 border-black border-2'}>
        <TaskGraph />
        <Options />
      </div>
      <TestList />
    </main>
  );
}
