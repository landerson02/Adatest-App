export type perturbedTestType = {
  id: string; // Test id
  test_parent: string; // Parent test id
  label: string; // Acceptable or Unacceptable
  title: string; // The essay
  type: string; // Type of perturbation
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
  ground_truth: string; // Ground truth of the perturbed test
  isChecked: boolean; // Checkbox state
};

export type PertDecisionsType = {
  [key: string]: perturbedTestType[];
};

export type PertType = {
  name: string;
  prompt: string;
  direction: string;
};

export type testType = {
  id: string;
  label: string; // Acceptable or Unacceptable
  title: string; // Actual test
  topic: string; // Concept - PE, KE, LCE
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
  ground_truth: string; // Ground truth of the test
  isChecked: boolean; // Checkbox state
  perturbedTests: perturbedTestType[];
};

export type TestDecisionsType = {
  [key: string]: {
    [key: string]: testType[];
  };
};

export type TestListType = {
  [key: string]: testType[];
};

export type testDataType = {
  tests: TestListType;
  currentTests: testType[];
  test_decisions: TestDecisionsType;
  pert_decisions: PertDecisionsType;
};

export type graphDataType = {
  [key: string]: {
    [key: string]: testType[] | perturbedTestType[];
  };
};
