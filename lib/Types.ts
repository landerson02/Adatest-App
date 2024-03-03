
export interface testType {
  id: number,
  label: string, // Acceptable or Unacceptable
  title: string, // Actual test
  topic: string, // Concept - PE, KE, LCE
  validity: string, // Accepted
  choice: 'approve' | 'deny' | 'trash' | '' | null,
}
