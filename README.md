# AIBAT - Adaptive Intelligent Behavioral Assessment Tool
This is a full stack application built with Next.js and Django implementing the 
[adatest](https://github.com/microsoft/adaptive-testing) library, to allow for a 
more user-friendly and complete end-to-end experience.

It allows users to generate, grade, and review results of adaptive test cases.

## Getting started
Clone the repository

Create a .env file in /backend with the following content:
```
MODEL=modelname
HUGGING_FACE_TOKEN=your_hugging_face_token # only needed if modelname=mistral
OPENAI_API_KEY=your_openai_api_key # only needed if modelname=openai
```
where modelname is the name of the model you want to use. (mistral or openai)

### If using Docker:
- run the following command to start the application: ``` docker-compose up ```
 - Stop the application with the following command: ``` docker-compose down ```

### If not using Docker:
#### Backend:
- in /backend, set up a conda environment and run the following commands to install packages:
```
pip install --upgrade pip
pip install notebook==6.1.5
pip install -r ${MODEL}_requirements.txt
```
- run the following command to start the backend server
  - ``` python manage.py runserver ```

#### Frontend:
- in /frontend, run the following commands:
```
npm i
# npm i only needs to be run once
npm run dev
```
Docker or not, the application will be available at http://localhost:8000

# Running the Application on the VM
To ssh into the vm, first retrieve the ssh key "adatest.pem." 
Then, on a terminal in a folder that contains adatest.pem on your local computer, give it permissions with the command
``` chmod 600 adatest.pem ```

Next, go to the Lambda Cloud team page to start up an instance (any instance type is fine but A10 is best,
Region: Viriginia-East, Attach Adatest Filesystem, and make it use adatest key) Once the instance is launched, 
grab the ssh command (should look like ssh ubuntu@1280.136.135) copy the address (without the ssh) and 
replace it with the 'address' in the code tag below. 

Then ssh into the vm with the command:
``` ssh -i adatest.pem <address> -L localhost:8000:localhost:8000 ```

Once in the vm, you will be able to navigate into the Adatest folder and run the vm_setup script
```
cd Adatest/Adatest-App
bash vm-setup.sh
```
This installs and give permissions to everything for the app and Docker to run. 
Due to the nature of docker, it is unable to use gpu during build, and I have not quite yet figured it out yet. Therefore,
run the application locally to use the gpu by running 
go to backend folder: ``` python manage.py runserver ``` then go to frontend folder: ```npm run dev```

You may need to open another terminal window to run the following command to ssh into the vm again to run the application:
``` ssh -i adatest.pem <address> -L localhost:8000:localhost:8000 ```

To stop the application, run the following command:
``` docker-compose down ```

To start the application, run the following command:
``` docker-compose up ```

The application will be available at http://localhost:8000

# In Case vm_setup.sh fails
The VM won't have any packages installed, use the following commands to download docker-compose:
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
cd /frontend
nvm install node
npm i 
```
The .env file should already be in the vm filesystem, but in case it isn't, you will need to get that as well from somebody.
After doing this and getting your .env file, run 
```    
docker-compose up
```
and the application should be available at http://localhost:8000
