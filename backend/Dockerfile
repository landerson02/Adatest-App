#Pull the official base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code

# Install dependencies
ADD requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

#Copy Project
ADD . /code/

EXPOSE 8000

CMD ["python3", "/code/manage.py", "runserver", "0.0.0.0:8000"]