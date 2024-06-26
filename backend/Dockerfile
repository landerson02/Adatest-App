#Pull the official base image
FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

# Set environment variables to ones in .env file
ARG MODEL
ARG HUGGINGFACE_TOKEN
ARG OPENAI_API_KEY
ENV MODEL ${MODEL?modelnotset}
ENV HUGGINGFACE_TOKEN ${HUGGINGFACE_TOKEN?hftokennotset}
ENV OEPNAI_API_KEY ${OPENAI_API_KEY?oakeynotset}
ENV LD_LIBRARY_PATH /usr/local/cuda/lib64/stubs/:$LD_LIBRARY_PATH

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code

# Install dependencies
RUN pip install --upgrade pip
RUN pip install notebook==6.1.5
# Installs requirements based on MODEL from .env file
ADD ${MODEL}_requirements.txt /code/
RUN pip install -r ${MODEL}_requirements.txt

# Setup huggingface token access
RUN echo %{HUGGINGFACE_TOKEN}
RUN huggingface-cli login --token ${HUGGINGFACE_TOKEN} --add-to-git-credential

#Copy Project
ADD . /code/

EXPOSE 8000

CMD ["python3", "/code/manage.py", "runserver", "0.0.0.0:8000"]