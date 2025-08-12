FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/apps

WORKDIR /apps/AI

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# 컨텍스트가 apps/AI 이므로 이 한 줄이면 /apps/AI 아래에 api/, main.py 등이 복사됨
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
