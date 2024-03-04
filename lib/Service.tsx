
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