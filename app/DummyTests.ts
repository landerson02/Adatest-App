
export type testType = {
  test: string,
  label: string,
  concept: string,
  output: string,
  id: number
}

export function createFakeTests() {
  let tests : testType[] = [];
  for (let i = 1; i < 100; i++) {
    let c;
    if(i%3==0) c = 'PE';
    else if(i%3==1) c = 'KE';
    else c = 'LCE';
    tests.push({test: `test${i}`, label: `Test ${i}`, concept: c, id: i, output: `output${i}`})
  }
  return tests;
}