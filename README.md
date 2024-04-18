This branch is the Adatest integration using Mistral-7b-Instruct-v0.2 model
Requires ~8GB VRAM to run. 

## Getting Started

1. Run the development server:
cd frontend/ folder
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
2. In a separate terminal:
cd backend/ folder
```bash
# run the following command
python3 manage.py runserver
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the application.

3. Clear the old tests using: [http://localhost:8000/core/tests/clear](http://localhost:8000/core/tests/clear)
4. Initialize new tests from NTX_test.csv files: [http://localhost:8000/core/tests/init](http://localhost:8000/core/tests/init)
