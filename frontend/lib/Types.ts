export interface testType {
  id: string;
  label: string; // Acceptable or Unacceptable
  title: string; // Actual test
  topic: string; // Concept - PE, KE, LCE
  validity: string; // Approved, Denied, Invalid, Unapproved (default)
}

export type TestDecisionsType = {
  [key: string]: {
    approved: testType[];
    denied: testType[];
    trashed: testType[];
  };
};
