# AIBAT - Adaptive Intelligent Behavioral Assessment Tool
This is a full stack application built with Next.js and Django implementing the 
[adatest](https://github.com/microsoft/adaptive-testing) library, to allow for a 
more user-friendly and complete end-to-end experience.

It allows users to generate, grade, and review results of adaptive test cases.

## Getting started
Clone the repository

Create a .env file in /backend with the following content:
```
MODEL=modelname # mistral or openai
HUGGING_FACE_TOKEN=your_hugging_face_token # only needed if modelname=mistral
OPENAI_API_KEY=your_openai_api_key # only needed if modelname=openai
```

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


#### Frontend:
- in /frontend, run the following commands to install packages:
```
npm install
```
#### Running the application:
- in /scripts, run the following command to run the application: 
```
bash start-application.sh
```
- in /scripts, run the following command to stop the application:
```
bash stop-application.sh
```
Docker or not, the application will be available at http://localhost:8000

# Running the Application on the VM
To ssh into the vm, first retrieve the ssh key "adatest.pem." 
Then, on a terminal in a folder that contains adatest.pem on your local computer, give it permissions with the command
``` chmod 600 adatest.pem ```

Next, go to the Lambda Cloud team page to start up an instance (any instance type is fine but A10 is best,
Region: Viriginia-East, Attach Adatest Filesystem, and make it use adatest key) Once the instance is launched, 
grab the ssh command (should look like ssh ubuntu@1280.136.135) copy the address (without the ssh) and 
replace it with the 'address' in the code below. 

Then ssh into the vm with the command:
``` ssh -i adatest.pem ubuntu@<address> -L localhost:8000:localhost:8000 ```

## To Run Locally (Without Docker)
Once in the vm, you will be able to navigate into the Adatest folder and run the vm_setup script.
This installs and give permissions to everything for the app and Docker to run. 
```
cd Adatest/Adatest-App/scripts
bash vm-setup.sh
source ~/.bashrc
```
In the same directory, stop run the application, run following command: 
```
bash start-application.sh
```
To stop the application, run the following command:
```
bash stop-application.sh
```
## To Run With Docker (currently not working)
To run the application with docker, you will first need to run the shell script to set everything up for it
```
cd Adatest/Adatest-App/scripts
bash docker-gpu.sh
```

To stop the application, run the following command:
``` docker-compose down ```

To start the application, run the following command:
``` docker-compose up ```

The application will be available at http://localhost:8000

## Retrieving Log Files
Once finished, click "End Session", it will save log files to the /Adatest/Adatest-App/backend folder.
To retrieve these files, you will need to use the scp command. 

In the same directory as the adatest.pem file, run the following command:
```
scp -i adatest.pem ubuntu@<address>:/home/ubuntu/Adatest/Adatest-App/backend/log.csv <destination in local>
```
You will need to replace the "address" with the address of the VM and "destination in local" with the location 
you want to save the log file to on your local computer. This command saves the file "log.txt" to the location you specify, 
but you will also need to save the files "perturbations.txt" and "tests.txt" in the same way. Just replace the "log.txt" 
in the scp command with the file you want to save.
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
