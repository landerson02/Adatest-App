import React, { createContext, useState, useContext } from 'react';
import {testType} from "@/lib/Types";

type TestContextType = {
  approvedTests: testType[];
  setApprovedTests: (value: testType[]) => void;
  deniedTests: testType[];
  setDeniedTests: (value: testType[]) => void;
  trashedTests: testType[];
  setTrashedTests: (value: testType[]) => void;
}

export const TestContext = createContext<TestContextType>(
  {
    approvedTests: [],
    setApprovedTests: () => {},
    deniedTests: [],
    setDeniedTests: () => {},
    trashedTests: [],
    setTrashedTests: () => {},
  } as TestContextType
);

export const TestContextProvider = ({ children }: any) => {
  const [approvedTests, setApprovedTests] = useState<testType[]>([]);
  const [deniedTests, setDeniedTests] = useState<testType[]>([]);
  const [trashedTests, setTrashedTests] = useState<testType[]>([]);

  return (
    <TestContext.Provider value={{ approvedTests, setApprovedTests, deniedTests, setDeniedTests, trashedTests, setTrashedTests }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => useContext(TestContext);
