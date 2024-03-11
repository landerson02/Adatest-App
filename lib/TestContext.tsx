import React, { createContext, useState, useContext } from 'react';
import {testType, TestDecisionsType} from "@/lib/Types";

// type TestContextType = {
//   approvedTests: testType[];
//   setApprovedTests: (value: testType[]) => void;
//   deniedTests: testType[];
//   setDeniedTests: (value: testType[]) => void;
//   trashedTests: testType[];
//   setTrashedTests: (value: testType[]) => void;
// }
//
// export const TestContext = createContext<TestContextType>(
//   {
//     approvedTests: [],
//     setApprovedTests: () => {},
//     deniedTests: [],
//     setDeniedTests: () => {},
//     trashedTests: [],
//     setTrashedTests: () => {},
//   } as TestContextType
// );
//
// export const TestContextProvider = ({ children }: any) => {
//   const [approvedTests, setApprovedTests] = useState<testType[]>([]);
//   const [deniedTests, setDeniedTests] = useState<testType[]>([]);
//   const [trashedTests, setTrashedTests] = useState<testType[]>([]);
//
//   return (
//     <TestContext.Provider value={{ approvedTests, setApprovedTests, deniedTests, setDeniedTests, trashedTests, setTrashedTests }}>
//       {children}
//     </TestContext.Provider>
//   );
// };
//
// export const useTestContext = () => useContext(TestContext);


const initialTestDecisions: TestDecisionsType = {
  PE: {
    approved: [],
    denied: [],
    trashed: [],
  },
  KE: {
    approved: [],
    denied: [],
    trashed: [],
  },
  LCE: {
    approved: [],
    denied: [],
    trashed: [],
  }
}

type TestDecisionscontextType = {
  testDecisions: TestDecisionsType;
  setTestDecisions: (value: TestDecisionsType) => void;
  currentTopic: string;
  setCurrentTopic: (value: string) => void;
}

export const TestDecisionsContext = createContext<TestDecisionscontextType>({
  testDecisions: initialTestDecisions,
  setTestDecisions: () => {},
  currentTopic: 'PE',
  setCurrentTopic: () => {},
});

export const TestDecisionsProvider = ({ children }: any) => {
  const [testDecisions, setTestDecisions] = useState<TestDecisionsType>(initialTestDecisions);
  const [currentTopic, setCurrentTopic] = useState<string>('PE');
  return (
    <TestDecisionsContext.Provider value={{ testDecisions, setTestDecisions, currentTopic, setCurrentTopic}}>
      {children}
    </TestDecisionsContext.Provider>
  );
};