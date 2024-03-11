import {testType} from "@/lib/Types";

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

export async function generateTests(topic: string) {
  const url = `core/tests/post/${topic}`
  try {
     await fetch(url, {
       method: 'POST',
       cache: "no-store",
       body: JSON.stringify({topic}),
    });
    return await getTests(topic);
  } catch (error) {
    console.log(error);
  }
}

// export async function clearTests() {
//   const url = 'core/tests/clear';
//   try {
//     await fetch(url, {
//       method: 'DELETE',
//       cache: "no-store",
//     });
//     return await getTests();
//   } catch (error) {
//     console.log(error);
//   }
// }

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

export async function approveTests(tests: testType[], topic: string) {
  const url = `core/tests/approve/${topic}`;
    try {
      await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify(tests),
      });
    } catch (e) {
      console.log(e);
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

export async function denyTests(tests: testType[], topic: string) {
  const url = `core/tests/deny/${topic}`
    try {
      await fetch(url, {
        method: 'POST',
        cache: "no-store",
        body: JSON.stringify(tests),
      });
    } catch (error) {
      console.log(error);
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

export async function trashTests(tests: testType[], topic: string) {
  const url = `core/tests/delete/${topic}`
  try {
    await fetch(url, {
      method: 'POST',
      cache: "no-store",
      body: JSON.stringify(tests),
    });
  } catch (error) {
    console.log(error);
  }
}
