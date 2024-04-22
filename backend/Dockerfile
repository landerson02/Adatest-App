#Pull the official base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV MODEL=mistral

RUN mkdir /code
WORKDIR /code

# Install dependencies
ADD requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install notebook==6.1.5
RUN pip install -r requirements.txt
# add the bottom two commands if not running mistral model
#RUN pip uninstall git+https://github.com/aayushb03/adatest_mod/@bca00d16a43bd5c75c2b54c0d80243e1aec7b7ea
#RUN pip install adatest


#Copy Project
ADD . /code/

EXPOSE 8000

CMD ["python3", "/code/manage.py", "runserver", "0.0.0.0:8000"]