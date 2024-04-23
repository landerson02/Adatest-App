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

### FOR VM USE ONLY:
To ssh into the vm, first retrieve adatest.pem
Then, in a folder that contains adatest.pem, give it permissions with the command
```
chmod 600 adatest.pem
```
Then ssh into the vm with the command:
```
ssh -i adatest.pem ubuntu@129.213.82.253 -L localhost:8000:localhost:8000
```
if the vm does not yet have docker installed for some reason, use the following commands:
```
sudo apt update -y
sudo apt install -y docker
sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```
If there is a given docker-compose version it should be fine.
Then, in the frontend folder, we have to download npm/node and run npm i
To do this, run the following command:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
Then, after restarting terminal window, run the following command:
```
cd frontend
nvm install node
npm i 
```
After doing this, run 
```    
docker-compose up
```
and the application should be available at http://localhost:8000