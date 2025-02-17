# Run frontend
cd ../frontend || return
npm run dev &

# Run backend
cd ../backend || return
python3 manage.py runserver &

ngrok http --url=true-directly-mollusk.ngrok-free.app localhost:8000
