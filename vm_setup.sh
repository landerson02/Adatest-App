sudo apt update -y
sudo apt install -y docker
sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
cd Adatest-App/frontend || return
nvm install node
npm i

cd ..
sudo docker-compose up