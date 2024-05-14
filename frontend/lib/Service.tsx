import { perturbedTestType, testType } from "@/lib/Types";

/**
  * Gets an array of tests based off of the topic
  * @param topic PE, KE, or LCE
  * @returns An array of tests
  */
export async function getTests(topic: string) {
  const url = `core/tests/get/${topic}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });
    // checks that the response is valid
    if (!res.ok) {
      throw new Error("Failed to get tests");
    }
    // creates and maps an array of Test Objects
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

/**
  * Generates tests for the given topic
  * @param topic PE, KE, or LCE
  * @returns all tests for the topic
  */
export async function generateTests(topic: string) {
  const url = `core/tests/post/${topic}`
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      body: JSON.stringify({ topic }),
    });
    return await getTests(topic);
  } catch (error) {
    console.error(error);
  }
}

/** 
  * Approves a list of tests
  * @param tests List of tests to be approved
  * @param topic PE, KE, LCE
  */
export async function approveTests(tests: testType[], topic: string) {
  if (tests.length === 0) return;
  const url = `core/tests/approve/${topic}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(tests),
    });
  } catch (e) {
    console.error(e);
  }
}

/** 
  * Denies a list of tests
  * @param tests List of tests to be denied
  * @param topic PE, KE, LCE
  */
export async function denyTests(tests: testType[], topic: string) {
  if (tests.length === 0) return;
  const url = `core/tests/deny/${topic}`
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tests),
    });
  } catch (error) {
    console.error(error);
  }
}

/** 
  * Trashes a list of tests
  * @param tests List of tests to be trashed
  * @param topic PE, KE, LCE
  */
export async function trashTests(tests: testType[], topic: string) {
  if (tests.length === 0) return;
  const url = `core/tests/invalidate/${topic}`
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tests),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function logAction(test_ids: string[], action: string) {
  const url = `core/logs/add`;
  let tests = ""
  test_ids.forEach((test_id) => {
    tests += test_id + ","
  });
  const data = {
    test_ids: tests,
    action: action
  }
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function saveLogs() {
  const url = `core/logs/save`;
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
    });
  } catch (error) {
    console.error(error);
  }
}


/**
 * Reset the tests in the database
 * Calls clear then init
 */
export async function resetDB() {
  try {
    await fetch('core/tests/clear', {
      method: 'DELETE',
      cache: 'no-store',
    });
    await fetch('core/tests/init', {
      method: 'POST',
      cache: 'no-store'
    });
  } catch (error) {
    console.error(error);
  }
}

/**
  * creates perturbations for the given tests
  * @param tests List of tests to be approved
  * @param topic PE, KE, LCE
  */
export async function createPerturbations(tests: testType[], topic: string) {
  if (tests.length === 0) return;
  const url = `core/perturbations/generate/${topic}`;
  try {
    const perturbations = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(tests),
    });
    return await perturbations.json()
  } catch (e) {
    console.error(e);
  }
}

/**
  * Gets an array of perturbations based off of the topic
  * @param topic PE, KE, or LCE
  * @returns An array of perturbations
  */
export async function getPerturbations() {
  const url = `core/perturbations/get`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: "no-store",
    });
    // checks that the response is valid
    if (!res.ok) {
      throw new Error("Failed to get perturbations");
    }
    // creates and maps an array of Test Objects
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}


/**
 * Adds a test to the database
 * @param test
 * @param topic
 * @param groundTruth
 */
export async function addTest(test: testType, topic: string, groundTruth: string) {
  const url = `core/tests/add/${topic}/${groundTruth}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test }),
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Edits a test in the database
 * @param test
 * @param topic
 */
export async function editTest(test: testType | perturbedTestType, topic: string, isPert: boolean = false) {
  const url = `core/${isPert ? 'perturbations' : 'tests'}/edit/${topic}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test }),
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Deletes a test from the database
 * @param tests List of perturbed tests to be validated
 * @param validation Approved, Denied, Invalid
 */
export async function validatePerturbations(tests: perturbedTestType[], validation: string) {
  const url = `core/perturbations/validate/${validation}`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tests),
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Creates a new perturbation type
 * @param tests List of tests to be perturbed
 * @param type Type of perturbation (e.g. synonyms, spelling, etc.)
 * @param prompt AI Prompt
 * @param testDirection Direction of the test(INV, DIR)
 * @param topic Topic of the perturbation
 * @returns //TODO: ??????
 */
export async function addNewPerturbation(tests: testType[], type: string, prompt: string, testDirection: string, topic: string) {
  const url = `core/perturbations/add/${topic}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test_list: tests,
        prompt: prompt,
        flip_label: testDirection === 'DIR',
        pert_name: type,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Tests the new perturbation type
 * @param type Type of perturbation (e.g. synonyms, spelling, etc.)
 * @param prompt AI Prompt
 * @param statement Statement to test
 * @param direction Direction of the test(INV, DIR)
 * @param topic Topic of the perturbation
 * @returns //TODO: ??????
 */
export async function testNewPerturbation(type: string, prompt: string, statement: string, direction: string, topic: string) {
  const url = `core/perturbations/test/${topic}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test_case: statement,
        prompt: prompt,
        flip_label: direction === 'DIR',
        pert_name: type,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}
