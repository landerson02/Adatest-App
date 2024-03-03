// 'use client'

import React, { useState, useEffect } from 'react';
import {testType} from "@/lib/Types";
import Row from "@/app/components/Row";

type testListProps = {
  tests: testType[]
}

const TestList = ({ tests } : testListProps) => {
  // const [tests, setTests] = useState<testType[]>([]);
  //
  // useEffect(() => {
  //   console.log('creating tests')
  //   const newTests = createFakeTests();
  //   setTests(newTests);
  // }, []);
  //
  // console.log(tests);
  return (
    <div className={'w-full h-screen flex flex-col gap-2 overflow-y-scroll'}>
        <div className={'sticky top-0 border-black border-b-2 w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-300'}>
          <div className={'text-xl w-[70%] text-center'}>Test</div>
          <div className={'ml-auto flex w-[30%] justify-between pr-2'}>
            <div className={'text-xl w-[33%]'}>Topic</div>
            <div className={'text-xl w-[33%]'}>Label</div>
            <div className={'text-xl w-[33%]'}>Decide</div>
          </div>
        </div>
      {tests && tests.map((test: testType, index: number) => {
        return <Row key={index} test={test}/>
        })}
    </div>
  );
}

export default TestList;
