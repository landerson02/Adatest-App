export interface testType {
  id: string;
  label: string; // Acceptable or Unacceptable
  title: string; // Actual test
  topic: string; // Concept - PE, KE, LCE
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
  isChecked: boolean; // Checkbox state
}

export type TestDecisionsType = {
  [key: string]: {
    approved: testType[];
    denied: testType[];
    trashed: testType[];
  };
};

export type TestListType = {
  [key: string]: testType[];
};

export type testDataType = {
  tests: TestListType;
  currentTests: testType[];
  decisions: TestDecisionsType;
};
