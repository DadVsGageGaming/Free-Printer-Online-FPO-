FROM python:3.11-slim
WORKDIR /app
COPY qc_check.py qc_wrapper.py requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python3", "qc_wrapper.py"]
