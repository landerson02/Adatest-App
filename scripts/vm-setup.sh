source ../backend/.env
#Frontend: React - NVM/NPM
cd ../frontend || return
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
pip install numpy==1.24.3
pip install notebook==6.1.5
pip install Django==4.2.11
pip install django_cors_headers==4.3.1
pip install django_rest_framework==0.1.0
pip install django-nextjs==2.4.0
pip install python-dotenv==1.0.1
pip install peft==0.10.0
pip install git+https://github.com/nytseng/adatest_mod@split-fix
# pip install git+https://github.com/nytseng/adatest_mod@llama
pip install openai==0.28.0
pip install checklist
pip install SentencePiece
pip install bitsandbytes
pip install torch -U
pip install jinja2==3.1.0

# Huggingface login token to use model
pip install --upgrade huggingface_hub
huggingface-cli login --token $LOGIN_TOKEN --add-to-git-credential

# Updates project
git pull




