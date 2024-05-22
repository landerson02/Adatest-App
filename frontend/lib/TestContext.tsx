'use client'
import React, { createContext, useState } from 'react';
import { testDataType } from "@/lib/Types";

const initTestData: testDataType = {
  tests: {
    // PE: [],
    // KE: [],
    // LCE: [],
    CU0: [],
    CU5: []
  },
  currentTests: [],

  test_decisions: {
    // PE: {
    //   approved: [],
    //   denied: [],
    //   invalid: [],
    // },
    // KE: {
    //   approved: [],
    //   denied: [],
    //   invalid: [],
    // },
    // LCE: {
    //   approved: [],
    //   denied: [],
    //   invalid: [],
    // },
    CU0: {
      approved: [],
      denied: [],
      invalid: [],
    },
    CU5: {
      approved: [],
      denied: [],
      invalid: [],
    }
  },
  pert_decisions: {
    approved: [],
    denied: [],
    invalid: [],
  },
}

type testDataContextType = {
  testData: testDataType;
  setTestData: (value: testDataType) => void;
  currentTopic: string;
  setCurrentTopic: (value: string) => void;
  isCurrent: boolean;
  setIsCurrent: (value: boolean) => void;
}

export const TestDataContext = createContext<testDataContextType>({
  testData: initTestData,
  setTestData: () => { },
  // Default topic for now
  currentTopic: 'CU0',
  setCurrentTopic: () => { },
  isCurrent: false,
  setIsCurrent: () => { },
});

export const TestDataProvider = ({ children }: any) => {
  const [testData, setTestData] = useState<testDataType>(initTestData);
  const [currentTopic, setCurrentTopic] = useState<string>('CU0');
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  return (
    <TestDataContext.Provider value={{ testData, setTestData, currentTopic, setCurrentTopic, isCurrent, setIsCurrent }}>
      {children}
    </TestDataContext.Provider>
  );
};
