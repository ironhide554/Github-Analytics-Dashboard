# 🚀 GitHub Analytics Dashboard

A modern full-stack web application that analyzes any GitHub user's profile and provides detailed insights about their contributions, repositories, streaks, and programming languages.

Built using **FastAPI**, **GitHub GraphQL API**, **HTML**, **CSS**, **JavaScript**, and **Chart.js**.

---

## 📸 Features

### 📊 Contribution Analytics

* Total Contributions
* Contributions for:

  * Last 1 Month
  * Last 3 Months
  * Last 6 Months
  * Last 1 Year
* Most Active Month
* Contribution Trends

### 🔥 Streak Analytics

* Longest Contribution Streak
* Streak Start Date
* Streak End Date

### 📁 Repository Analytics

* Most Worked Repository
* Repository Commit Count
* Public Repository Analysis

### 💻 Language Analytics

* Most Used Programming Language
* Language Distribution
* Interactive Pie Chart

### 🎨 Modern Dashboard

* Responsive Design
* Dark Theme UI
* Glassmorphism Cards
* Interactive Charts
* Loading Animations

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* Python
* GitHub GraphQL API
* Pandas
* Requests
* Python Dotenv

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Chart.js

---

## 📂 Project Structure

```bash
github-analytics-dashboard/

│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── routes.py
│   │
│   └── services/
│       ├── analytics.py
│       └── github_service.py
│
├── static/
│   ├── style.css
│   └── app.js
│
├── templates/
│   └── index.html
│
├── .env
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/github-analytics-dashboard.git

cd github-analytics-dashboard
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 GitHub API Token Setup

Generate a GitHub Personal Access Token.

GitHub Settings →

Developer Settings →

Personal Access Tokens →

Generate New Token (Classic)

Select:

```text
public_repo
read:user
```

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

---

## ▶️ Run Application

Start FastAPI server:

```bash
uvicorn app.main:app --reload
```

Server:

```text
http://127.0.0.1:8000
```

API Docs:

```text
http://127.0.0.1:8000/docs
```

---

## 🔍 Example API Request

```http
GET /analyze/torvalds?months=12
```

Example Response:

```json
{
  "success": true,
  "username": "torvalds",
  "total_contributions": 1284,
  "most_active_month": "March 2026",
  "top_language": "C",
  "most_worked_repository": {
    "name": "linux",
    "commit_count": 13472
  }
}
```

---

## 📈 Future Enhancements

* GitHub Contribution Heatmap
* Current Streak Calculation
* AI Generated Developer Summary
* Repository Insights Dashboard
* Export Report as PDF
* Download Analytics as CSV
* GitHub User Comparison
* Developer Score System
* Activity Forecasting

---

## 🎯 Learning Outcomes

This project demonstrates:

* FastAPI Development
* REST API Design
* GitHub GraphQL API Integration
* Data Analytics with Python
* Frontend Development
* Interactive Dashboards
* Data Visualization
* Full Stack Development

---

## 🤝 Contributing

Contributions are welcome.

Fork the repository and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sparsh Tiwari**


Passionate about Machine Learning, Deep Learning, FastAPI, and Full Stack AI Applications.
