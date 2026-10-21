# 🚀 GitHub Analytics Dashboard

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![GraphQL](https://img.shields.io/badge/GitHub_GraphQL_API-E10098?style=for-the-badge&logo=graphql&logoColor=white)](https://docs.github.com/en/graphql)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A modern, high-performance full-stack web application that delivers in-depth analytics, visual trends, and actionable insights for any GitHub developer profile. 

Powered by **FastAPI**, **GitHub GraphQL API v4**, **Pandas**, and an interactive, glassmorphic dark-mode dashboard built with **Chart.js** and **Vanilla JavaScript**.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🔄 How It Works](#-how-it-works)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [GitHub Token Setup](#-github-personal-access-token-setup)
  - [Running the Application](#-running-the-application)
- [🔌 API Reference](#-api-reference)
- [🎯 Roadmap & Future Enhancements](#-roadmap--future-enhancements)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [👨‍💻 Author](#-author)

---

## ✨ Key Features

### 👤 Profile Summary & 1-Click Exports
* **Live Developer Card**: Displays avatar, display name, handle, bio, followers, following, and total public repository count.
* **Quick Clipboard Copy**: Copy a concise, formatted summary of the developer's stats to your clipboard in one click.
* **Data Exporting**:
  * **JSON Export**: Download the complete analytics payload (`{username}-github-analytics.json`).
  * **CSV Export**: Export top repositories with metrics (stars, forks, commits, updated date, URL) as a structured spreadsheet (`{username}-top-repositories.csv`).

### ⚡ Smart Range Filtering & Quick Picks
* **Configurable Time Horizons**: Filter contribution metrics dynamically across **1 Month**, **3 Months**, **6 Months**, or **1 Year**.
* **Quick Search Chips**: Preset 1-click profiles for rapid testing (`@torvalds`, `@karpathy`, `@gaearon`, `@shadcn`).

### 📊 4-Pillar High-Signal KPI Metrics
1. **Contribution Volume**: Total contributions within the selected timeframe, count of active days, and average contributions per active day.
2. **Streak Tracking**: Current active streak alongside the longest streak with exact start and end dates.
3. **Ecosystem Reach & Impact**: Total accumulated stars, total forks across repositories, and total repositories analyzed.
4. **Primary Tech Stack**: Top programming language by codebase volume and the user's peak/most active contribution month.

### 📈 Interactive Tabbed Chart Visualizations (Chart.js)
* **Activity & Contributions**:
  * **Monthly Trend**: Smooth line chart depicting contribution trajectories over time.
  * **Weekday Activity**: Bar chart breaking down contribution distribution across days of the week (Monday – Sunday).
  * **Overview**: Bar chart comparing Total Commits, Longest Streak, Current Streak, and Active Days side by side.
* **Code & Repositories**:
  * **Languages**: Doughnut chart illustrating percentage and byte distribution of programming languages.
  * **Stars**: Horizontal bar chart highlighting the top 5 most-starred repositories.
  * **Commits**: Horizontal bar chart ranking repositories by commit count.

### 📁 Top Repositories Data Table
* Clean, sort-aligned table displaying top repositories with direct GitHub hyperlinks, language badges, star counts, fork counts, total default branch commits, and last updated timestamps.

### 🛡️ Production-Grade UX & Resilience
* **Glassmorphism Dark UI**: Built with custom CSS variables, responsive typography (*Plus Jakarta Sans* & *JetBrains Mono*), and fluid layouts.
* **Graceful Error Handling**: Clear diagnostics for invalid usernames, missing or expired API tokens, rate limits, and network disconnects.

---

## 🔄 How It Works

```mermaid
flowchart TD
    A[User enters GitHub username & selects timeframe] --> B[Frontend Client index.html / app.js]
    B -->|REST GET /analyze/:username?months=:n| C[FastAPI Backend app/main.py]
    C --> D[Analytics Pipeline app/services/analytics.py]
    D -->|GraphQL Query: Contribution Calendar| E[GitHub GraphQL API v4]
    D -->|GraphQL Query: Repositories & Languages| E
    E -->|Raw Calendar & Repo Payload| D
    D -->|Flatten Days & Streak Calculations| F[Pandas Data Processing Engine]
    F -->|Monthly & Weekday Aggregations| F
    F -->|Language Volume & Repo Ranking| F
    F -->|Structured JSON Analytics Object| C
    C -->|200 OK Response| B
    B -->|Render KPI Cards, Chart.js Visuals & Repo Table| G[Interactive User Dashboard]
    B -->|Export Handlers: JSON / CSV / Clipboard| H[Data Export Options]
```

1. **User Interaction**: The user enters any GitHub username (or picks a quick chip) and chooses a timeframe (1 to 12 months).
2. **FastAPI Request Routing**: The frontend sends an asynchronous `GET /analyze/{username}?months={months}` request to the FastAPI backend.
3. **Optimized GraphQL Queries**: `github_service.py` issues targeted GraphQL queries to fetch:
   * The user's `contributionsCollection` and `contributionCalendar` (weeks and days) for the exact ISO date window.
   * Up to 100 owner repositories with stars, forks, primary language, language byte distributions, and default branch commit histories.
4. **Pandas Analytical Computation**:
   * Flattens and dates contribution arrays.
   * Derives longest and active streaks (including exact calendar start/end dates).
   * Aggregates contributions by month and re-indexes weekday counts (Mon–Sun).
   * Aggregates byte-level repository languages to identify top language and distribution.
   * Compiles repository rankings and aggregate overview metrics.
5. **Interactive Presentation**: The browser renders the responsive profile banner, KPI cards, dual tabbed Chart.js charts, and repository table, enabling immediate inspection and export.

---

## 🛠️ Tech Stack

### Backend
* **FastAPI** — High-performance, asynchronous REST API framework
* **Uvicorn** — Lightning-fast ASGI web server
* **Pandas & NumPy** — Vectorized data transformations, calendar aggregation, and streak analytics
* **Requests** — HTTP client for GitHub GraphQL API communication
* **Python-Dotenv** — Environment variable management

### Frontend
* **HTML5 & CSS3** — Responsive dark-theme dashboard with custom glassmorphism styling
* **Vanilla JavaScript (ES6+)** — Reactive chart tab switching, asynchronous fetch API, and client-side data export
* **Chart.js** — Interactive line, bar, horizontal bar, and doughnut visualizations
* **Google Fonts** — *Plus Jakarta Sans* & *JetBrains Mono*

### External Services
* **GitHub GraphQL API (v4)** — Precision fetching of user contribution calendars and repository metadata

---

## 📂 Project Structure

```bash
Github-Analytics-Dashboard/
│
├── app/
│   ├── main.py                     # FastAPI application entry point with CORS setup
│   ├── api/
│   │   └── routes.py               # REST API endpoints (/analyze/{username})
│   └── services/
│       ├── github_service.py       # GitHub GraphQL query definitions & network client
│       └── analytics.py            # Pandas analytics engine & data pipeline
│
├── frontend/
│   ├── index.html                  # Dashboard layout, search controls & empty states
│   ├── css/
│   │   └── style.css               # Modern glassmorphism dark theme styles
│   └── js/
│       └── app.js                  # Frontend controllers, Chart.js renderers & exports
│
├── .env                            # Local environment variables (GITHUB_TOKEN)
├── .gitignore                      # Git ignore rules
├── LICENSE                         # MIT License
├── README.md                       # Project documentation
└── requirements.txt                # Python backend dependencies
```

---

## ⚙️ Getting Started

### Prerequisites

* **Python 3.10+** installed on your system.
* A **GitHub Personal Access Token** (read-only permissions).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/github-analytics-dashboard.git
   cd github-analytics-dashboard
   ```

2. **Create and activate a virtual environment**:
   * **Windows**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

### 🔑 GitHub Personal Access Token Setup

The application communicates with GitHub's GraphQL API, which requires an authenticated token.

1. Navigate to: **GitHub Settings** → **Developer Settings** → **Personal Access Tokens** → **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Select the following read-only scopes:
   * `read:user` (to read user profile data)
   * `public_repo` (to read public repository data)
4. Copy the generated token.
5. Create a `.env` file in the project root directory:
   ```env
   GITHUB_TOKEN=ghp_yourActualGitHubPersonalAccessTokenHere
   ```

---

### ▶️ Running the Application

1. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be live at: `http://127.0.0.1:8000`  
   Interactive Swagger documentation: `http://127.0.0.1:8000/docs`

2. **Open the Frontend**:
   * Open `frontend/index.html` in your browser, or
   * Use VS Code's **Live Server** extension, or
   * Run a quick static server:
     ```bash
     cd frontend
     python -m http.server 3000
     ```
     Then open `http://127.0.0.1:3000` in your web browser.

---

## 🔌 API Reference

### Analyze GitHub Profile

Analyzes contribution activity, streak metrics, language breakdown, and repository rankings for a given user.

```http
GET /analyze/{username}?months=12
```

#### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `username` | `string` | *(Required)* | Target GitHub login handle (e.g. `torvalds`) |
| `months` | `integer` | `12` | Analysis duration in months (`1`, `3`, `6`, or `12`) |

#### Sample Response

```json
{
  "success": true,
  "username": "torvalds",
  "profile": {
    "name": "Linus Torvalds",
    "login": "torvalds",
    "bio": "Creator of Linux and Git",
    "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
    "url": "https://github.com/torvalds",
    "followers": 224500,
    "following": 0,
    "public_repositories": 7
  },
  "time_range_months": 12,
  "total_contributions": 1420,
  "longest_streak": {
    "days": 42,
    "start": "2025-05-10",
    "end": "2025-06-20"
  },
  "most_active_month": "October 2025",
  "current_streak": 5,
  "active_days": 218,
  "average_per_active_day": 6.5,
  "most_worked_repository": {
    "name": "linux",
    "commit_count": 13540
  },
  "top_language": "C",
  "languages": {
    "C": 18459201,
    "Makefile": 240182,
    "Shell": 182390
  },
  "contribution_trend": {
    "Nov 2025": 110,
    "Dec 2025": 95,
    "Jan 2026": 130
  },
  "weekday_activity": {
    "Mon": 240,
    "Tue": 280,
    "Wed": 290,
    "Thu": 270,
    "Fri": 210,
    "Sat": 70,
    "Sun": 60
  },
  "repositories": {
    "top_starred": [
      {
        "name": "linux",
        "description": "Linux kernel source tree",
        "url": "https://github.com/torvalds/linux",
        "stars": 185000,
        "forks": 54000,
        "updated_at": "2026-04-18T10:00:00Z",
        "language": "C",
        "commits": 13540
      }
    ],
    "top_committed": [...]
  },
  "repository_overview": {
    "analyzed_count": 7,
    "total_stars": 185200,
    "total_forks": 54100,
    "total_commits": 14250,
    "average_stars": 26457.1,
    "recently_updated": {
      "name": "linux",
      "url": "https://github.com/torvalds/linux",
      "updated_at": "2026-04-18T10:00:00Z"
    }
  }
}
```

---

## 🎯 Roadmap & Future Enhancements

- [ ] **Contribution Calendar Heatmap**: Full interactive GitHub-style contribution squares grid.
- [ ] **AI-Powered Developer Summary**: LLM-generated developer profile summary highlighting strengths and commit style.
- [ ] **Multi-User Comparison**: Side-by-side comparative benchmarking for two or more GitHub developers.
- [ ] **PDF Report Generator**: Export polished developer portfolio summaries as downloadable PDFs.
- [ ] **Dockerization**: Complete containerization with `Dockerfile` and `docker-compose.yml` for unified 1-command deployment.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**.

---

## 📜 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Sparsh Tiwari**  
* GitHub: [@sparsh-tiwari](https://github.com/sparsh-tiwari)
