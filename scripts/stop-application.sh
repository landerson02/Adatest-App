npx kill-port 3000
lsof -t -i tcp:8000 | xargs kill -9