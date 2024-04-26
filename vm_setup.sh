#Docker
sudo apt update -y
sudo apt install -y docker
sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

#Frontend: React - NVM/NPM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
cd frontend || return
nvm install node
npm i

#Backend: Python - Django
cd ../backend || return
pip install --upgrade pip
pip install notebook==6.1.5
pip install -r mistral_requirements.txt
