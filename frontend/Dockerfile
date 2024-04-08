# node base image
FROM node:21-alpine

# copy all files to a docker directory at /app
COPY . /app

# copy necessary node setup files
COPY package.json ./
COPY package-lock.json ./

# change working directory
WORKDIR /app

# install dependencies
RUN npm upgrade
RUN npm i 

ENTRYPOINT [ "npm", "run", "dev" ]
EXPOSE 3000