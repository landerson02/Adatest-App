source .env
#Install Docker
sudo apt update -y
sudo apt install -y docker
sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup Nvidia-runtime-container for GPU support
sudo chown -R ubuntu /etc/docker/daemon.json
sudo cp daemon.json /etc/docker/
sudo systemctl restart docker
# Build image with gpu support
sudo docker build -t ada_backend:latest ./backend --build-arg MODEL=$MODEL --build-arg HUGGINGFACE_TOKEN=$HUGGINGFACE_TOKEN --build-arg OPENAI_API_KEY=$OPENAI_API_KEY
