import { testDataType, testType } from "./Types";

export function hasPerturbed(testData: testDataType): boolean {
  return (
    testData.pert_decisions.approved.length +
      testData.pert_decisions.denied.length >
    0
  );
}

export function hasUserDecided(testData: testDataType): boolean {
  return testData.currentTests.some(
    (test: testType) =>
      test.validity === "approved" || test.validity === "denied",
  );
}
