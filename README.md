# 🌐 Django Translation Widget

A one-click solution to translate any website to Hindi (or other languages) with multi-layer caching for optimal performance.

## ✨ Features

- **Instant Translation**: Convert entire pages to Hindi with one click
- **Smart Caching**: 3-layer cache (Browser → Server → Database) reduces API costs by 80%
- **Framework Agnostic**: Works with React, Angular, Vue, or plain HTML
- **Admin Dashboard**: Manage translations via Django Admin
- **Configurable UI**: Customize button position, color, and text
- **Auto-DOM Scanning**: No manual HTML tagging required

## 🛠 Tech Stack

**Backend**  
- Django 5.0
- Django REST Framework
- Google Translate API

**Frontend**  
- Vanilla JS Widget
- React (Demo Integration)

**Database & Caching**  
- SQLite (Development)
- PostgreSQL (Production-ready)
- Django Database Cache
- Browser LocalStorage

## 🚀 Installation

### Backend Setup
```bash
# Clone repo
git clone https://github.com/yourusername/translation-widget.git
cd translation-widget

# Set up virtual env (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Migrations
python manage.py migrate
python manage.py createcachetable

# Run server
python manage.py runserver
