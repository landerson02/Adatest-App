export type perturbedTestType = {
  id: string; // Test id
  test_parent: string; // Parent test id
  label: string; // Acceptable or Unacceptable
  title: string; // The essay
  type: string; // Type of perturbation
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
  isChecked: boolean; // Checkbox state
};

export type testType = {
  id: string;
  label: string; // Acceptable or Unacceptable
  title: string; // Actual test
  topic: string; // Concept - PE, KE, LCE
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
  isChecked: boolean; // Checkbox state
  perturbedTests: perturbedTestType[];
};

export type TestDecisionsType = {
  [key: string]: {
    approved: testType[];
    denied: testType[];
    invalid: testType[];
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
