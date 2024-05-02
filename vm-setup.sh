source .env
#Frontend: React - NVM/NPM
cd frontend || return
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install node
npm i
sudo chown -R ubuntu /home/ubuntu/Adatest/Adatest-App/frontend/.next

#Backend: Python - Django
cd ../backend || return
pip install --upgrade pip
pip install notebook==6.1.5
pip install Django
pip install django_cors_headers
pip install django_rest_framework
pip install django_nextjs
pip install python-dotenv
pip install peft
pip install git+https://github.com/aayushb03/adatest_mod/@bca00d16a43bd5c75c2b54c0d80243e1aec7b7ea
pip install openai
pip install checklist
pip install SentencePiece
pip install bitsandbytes

pip install --upgrade huggingface_hub
huggingface-cli login --token ${HUGGINGFACE_TOKEN} --add-to-git-credential
source ~/.bashrc
git pull



