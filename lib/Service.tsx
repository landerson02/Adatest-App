import { testType } from "@/lib/Types";

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
    console.log(error);
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
    console.log(error);
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
    console.log(e);
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
    console.log(error);
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
    console.log(error);
  }
}
