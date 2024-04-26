'use client'
import React, { createContext, useState } from 'react';
import { testDataType } from "@/lib/Types";

const initTestData: testDataType = {
  tests: {
    PE: [],
    KE: [],
    LCE: [],
  },
  currentTests: [],

  test_decisions: {
    PE: {
      approved: [],
      denied: [],
      invalid: [],
    },
    KE: {
      approved: [],
      denied: [],
      invalid: [],
    },
    LCE: {
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
}

export const TestDataContext = createContext<testDataContextType>({
  testData: initTestData,
  setTestData: () => { },
  currentTopic: 'PE',
  setCurrentTopic: () => {
  },
});

export const TestDataProvider = ({ children }: any) => {
  const [testData, setTestData] = useState<testDataType>(initTestData);
  const [currentTopic, setCurrentTopic] = useState<string>('PE');
  return (
    <TestDataContext.Provider value={{ testData, setTestData, currentTopic, setCurrentTopic }}>
      {children}
    </TestDataContext.Provider>
  );
};
