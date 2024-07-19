pip uninstall adatest
pip install git+https://github.com/nytseng/adatest_mod@llama

# Run frontend
cd ../frontend || return
npm run dev &

# Run backend
cd ../backend || return
python3 manage.py runserver &