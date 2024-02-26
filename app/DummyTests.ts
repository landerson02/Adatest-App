
export type testType = {
  id: number,
  label: string,
  title: string,
  topic: string,
  validity: string,
}

export function createFakeTests() {
  let tests : testType[] = [];
  for (let i = 1; i < 100; i++) {
    let c;
    if(i%3==0) c = 'PE';
    else if(i%3==1) c = 'KE';
    else c = 'LCE';
    // tests.push({test: `test${i}`, label: `Test ${i}`, concept: c, id: i, output: `output${i}`})
  }
  return tests;
}