source .env
sudo docker build -t ada_backend:latest ./backend --build-arg MODEL=$MODEL --build-arg HUGGINGFACE_TOKEN=$HUGGINGFACE_TOKEN --build-arg OPENAI_API_KEY=$OPENAI_API_KEY
