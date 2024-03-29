import React, { createContext, useState } from 'react';
import { TestDecisionsType } from "@/lib/Types";

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
        setTestDecisions: () => { },
        currentTopic: 'PE',
        setCurrentTopic: () => { },
});

export const TestDecisionsProvider = ({ children }: any) => {
        const [testDecisions, setTestDecisions] = useState<TestDecisionsType>(initialTestDecisions);
        const [currentTopic, setCurrentTopic] = useState<string>('PE');
        return (
                <TestDecisionsContext.Provider value={{ testDecisions, setTestDecisions, currentTopic, setCurrentTopic }}>
                        {children}
                </TestDecisionsContext.Provider>
        );
};
