# Run frontend
cd ../frontend || return
npm run dev &

# Run backend
cd ../backend || return
python3 manage.py runserver &