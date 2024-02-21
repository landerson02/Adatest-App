'use client'

import React, { useState, useEffect } from 'react';
import { testType, createFakeTests } from "@/app/DummyTests";
import Row from "@/app/components/Row";

const TestList = () => {
  const [tests, setTests] = useState<testType[]>([]);

  useEffect(() => {
    console.log('creating tests')
    const newTests = createFakeTests();
    setTests(newTests);
  }, []);

  console.log(tests);
  return (
    <div className={'w-full h-screen flex flex-col gap-2 overflow-y-scroll'}>
      {tests && tests.map((test: testType, index: number) => {
        return <Row key={index} test={test} />
      })}
    </div>
  );
}

export default TestList;
