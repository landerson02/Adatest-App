# Kill frontend
npx kill-port 3000

# Kill backend
lsof -t -i tcp:8000 | xargs kill -9