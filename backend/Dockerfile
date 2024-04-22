#Pull the official base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV MODEL=mistral

RUN mkdir /code
WORKDIR /code

# Install dependencies
RUN pip install --upgrade pip
RUN pip install notebook==6.1.5
# If running mistral model
#ADD mistral_requirements.txt /code/
#RUN pip install -r mistral_requirements.txt

# If running openai model
ADD openai_requirements.txt /code/
RUN pip install -r openai_requirements.txt


#Copy Project
ADD . /code/

EXPOSE 8000

CMD ["python3", "/code/manage.py", "runserver", "0.0.0.0:8000"]