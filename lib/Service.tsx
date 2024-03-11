import {testType} from "@/lib/Types";

export async function getTests() {
  const url = 'core/tests/get';
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

export async function generateTests() {
  const url = 'core/tests/post';
  try {
     await fetch(url, {
      method: 'POST',
      cache: "no-store",
    });
    return await getTests();
  } catch (error) {
    console.log(error);
  }
}

export async function clearTests() {
  const url = 'core/tests/clear';
  try {
    await fetch(url, {
      method: 'DELETE',
      cache: "no-store",
    });
    return await getTests();
  } catch (error) {
    console.log(error);
  }
}

export async function approveTest(id: string) {
  const url = `core/tests/approve/${id}`;
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      // body: JSON.stringify(id)
    });
    // return await getTests();
  } catch (error) {
    console.log(error);
  }
}

export async function approveTests(tests: testType[]) {
  const url = `core/tests/approve/`;
  for(let test of tests) {
    try {
      console.log('approving: ');
      console.log(test);
      await fetch(url + test.id, {
        method: 'POST',
        cache: 'no-store'
      });
    } catch (e) {
      console.log(e);
    }
  }
}

export async function denyTest(id: string) {
  const url = `core/tests/deny/${id}`;
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      // body: JSON.stringify(id)
    });
    // return await getTests();
  } catch (error) {
    console.log(error);
  }
}

export async function denyTests(tests: testType[]) {
  const url = 'core/tests/deny/'
  for(let test of tests) {
    try {
      await fetch(url + test.id, {
        method: 'POST',
        cache: "no-store",
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export async function trashTest(id: string) {
  const url = `core/tests/delete/${id}`;
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      // body: JSON.stringify(id)
    });
    // return await getTests();
  } catch (error) {
    console.log(error);
  }
}
