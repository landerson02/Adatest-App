This is a full stack application built with Next.js and Django implementing the 
[adatest](https://github.com/microsoft/adaptive-testing) library, to allow for a 
more user-friendly and complete end-to-end experience.

It allows users to generate, grade, and review results of adaptive test cases.

## Getting started
Clone the repository

Create a .env file with the following content:
```angular2html
MODEL=modelname
```
where modelname is the name of the model you want to use. (mistral or openai)

### If using Docker:
- place the .env in the application root
- run the following command:
```
docker-compose up
```

### If not using Docker:
- place the .env in /backend
- in /backend, run the following command:
```
python manage.py runserver
```
- in /frontend, run the following command:
```
npm i
# npm i only needs to be run once

npm run dev
```

Docker or not, the application will be available at http://localhost:8000
