import {
  PertType,
  perturbedTestType,
  testDataType,
  testType,
} from "@/lib/Types";
import { getPerturbations, getTests, getTopics } from "@/lib/Service";

/**
 * Checks if the user has perturbed any tests
 * @param testData the test data state
 * @returns true if the user has perturbed any tests
 */
export function hasPerturbed(testData: testDataType): boolean {
  return testData.currentTests?.some(
    (test: testType) => test.perturbedTests.length > 0,
  );
}

/**
 * Check if the user has made a decision on any test
 * @param testData the test data
 * @returns true if the user has made a decision on any test
 */
export function hasUserDecided(testData: testDataType): boolean {
  return testData.currentTests.some(
    (test: testType) =>
      test.validity === "approved" || test.validity === "denied",
  );
}

/**
 * Toggle a test's checked status
 * @param test the test to toggle
 * @param testData the current test data
 * @param setTestData state function to set the test data
 */
export function toggleCheck(
  test: testType,
  testData: testDataType,
  setTestData: (testData: testDataType) => void,
): void {
  // find and toggle test
  const newTests = testData.currentTests.map((t: testType) => {
    if (test.id === t.id) {
      return { ...test, isChecked: !test.isChecked };
    }
    return t;
  });
  // Create and return updated test data
  const newTD: testDataType = {
    ...testData,
    currentTests: newTests,
  };
  setTestData(newTD);
}

/**
 * Fetch, filter out invalid, and sort tests by validity
 * @param topic the topic to fetch tests for
 * @returns the tests
 */
export async function fetchAndProcessTests(topic: string): Promise<testType[]> {
  let data: testType[] = await getTests(topic);

  if (data && data.length > 0) {
    data = data.reverse();
    data.forEach((test: testType) => {
      test.isChecked = false;
    });
    data = data.filter((test: testType) => test.validity != "invalid");
    data.sort((a, b) => {
      if (a.validity == "unapproved" && b.validity != "unapproved") {
        return -1; // Move a to the back
      } else if (a.validity != "unapproved" && b.validity == "unapproved") {
        return 1; // Move b to the back
      } else {
        return 0; // Preserve the order
      }
    });
  }
  return data;
}

/**
 * Loads in tests and processes them accordingly
 * @param filterMap the filter map
 * @param currentTopic the current topic
 * @param isAutoCheck if auto check is enabled
 * @param testData the test data
 * @param setTestData the state function to set the test data
 * @param setIsCurrent the state function to set the current status
 * @param setCurrentTopic sets current topic
 */
export async function fetchTests(
  filterMap: { [key: string]: string },
  currentTopic: string,
  isAutoCheck: boolean,
  testData: testDataType,
  setTestData: (testData: testDataType) => void,
  setIsCurrent: (isCurrent: boolean) => void,
  setCurrentTopic: (topic: string) => void,
) {
  const topics = await getTopics();
  if (!topics.includes(currentTopic)) {
    setCurrentTopic(topics[0]);
    return;
  }
  let testArrays: { [key: string]: testType[] } = {};

  // Get all perturbed tests
  let perturbedTests: perturbedTestType[] = await getPerturbations();
  // Filter out invalid perturbations
  perturbedTests = perturbedTests.filter(
    (perturbedTest: perturbedTestType) => perturbedTest.validity != "invalid",
  );
  // Assign perturbed tests to their parent tests
  for (let type of topics) {
    testArrays[type] = await fetchAndProcessTests(type);
    testArrays[type].forEach((test: testType) => {
      test.perturbedTests = perturbedTests.filter(
        (perturbedTest: perturbedTestType) =>
          perturbedTest.test_parent === test.id,
      );

      // Filter perts
      if (filterMap.pert !== "") {
        test.perturbedTests = test.perturbedTests.filter(
          (pt: perturbedTestType) =>
            pt.type.toLowerCase() === filterMap["pert"].toLowerCase(),
        );
      }

      // Filter by label
      if (filterMap.label !== "") {
        test.perturbedTests = test.perturbedTests.filter(
          (pt: perturbedTestType) =>
            pt.label.toLowerCase() === filterMap["label"].toLowerCase(),
        );
      }
    });
  }

  // curTests are the ones that are currently being displayed
  let curTests: testType[] = [...testArrays[currentTopic]];

  // Filter tests

  // By label
  if (filterMap["label"] !== "") {
    curTests = curTests.filter(
      (test: testType) =>
        test.perturbedTests.length != 0 ||
        test.label.toLowerCase() === filterMap["label"],
    );
  }

  // By user decision
  if (filterMap["grade"] !== "") {
    let filtering: string = "";
    if (filterMap["grade"] === "Agreed") {
      filtering = "approved";
    } else if (filterMap["grade"] === "Disagreed") {
      filtering = "denied";
    } else if (filterMap["grade"] === "Ungraded") {
      filtering = "unapproved";
    } else {
      console.error("Invalid grade filter");
      filtering = "";
    }
    curTests = curTests.filter(
      (test: testType) => test.validity.toLowerCase() === filtering,
    );
  }

  if (curTests.length > 0 && isAutoCheck) curTests[0].isChecked = true;

  const newTestDecisions = testData.test_decisions;
  const newPertDecisions = testData.pert_decisions;

  for (const key1 in newTestDecisions) {
    for (const key2 in newTestDecisions[key1]) {
      newTestDecisions[key1][key2] = []; // Set the array to an empty array
    }
  }
  for (const key1 in newPertDecisions) {
    newPertDecisions[key1] = []; // Set the array to an empty array
  }

  for (const topic of topics) {
    if (!newTestDecisions[topic]) {
      newTestDecisions[topic] = {};
    }
    newTestDecisions[topic]["approved"] = [];
    newTestDecisions[topic]["denied"] = [];
    for (const test of testArrays[topic]) {
      if (test.validity == "unapproved" || test.topic != currentTopic) continue;
      newTestDecisions[topic][test.validity.toLowerCase()].push(test);
      for (const perturbedTest of test.perturbedTests) {
        if (perturbedTest.validity == "unapproved") continue;
        newPertDecisions[perturbedTest.validity.toLowerCase()].push(
          perturbedTest,
        );
      }
    }
  }

  let newTestData: testDataType = {
    tests: {},
    currentTests: curTests,
    test_decisions: newTestDecisions,
    pert_decisions: newPertDecisions,
  };
  for (const topic of topics) {
    newTestData.tests[topic] = testArrays[topic];
  }
  setTestData(newTestData);
  setIsCurrent(true);
}
