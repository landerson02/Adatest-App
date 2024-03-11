
export interface testType {
  id: string,
  label: string, // Acceptable or Unacceptable
  title: string, // Actual test
  topic: string, // Concept - PE, KE, LCE
  validity: string, // Accepted
}

export type TestDecisionsType = {
  PE: {
    approved: testType[],
    denied: testType[],
    trashed: testType[],
  },
  KE: {
    approved: testType[],
    denied: testType[],
    trashed: testType[],
  },
  LCE: {
    approved: testType[],
    denied: testType[],
    trashed: testType[],
  }
}
