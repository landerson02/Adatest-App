cd ../frontend || return
npm run dev &

cd ../backend || return
python3 manage.py runserver &