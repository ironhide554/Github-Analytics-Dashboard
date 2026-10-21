let latestAnalytics = null;
let activityChart = null;
let codeChart = null;

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "N/A";
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch {
        return String(value);
    }
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function downloadJson() {
    if (!latestAnalytics) return;
    downloadFile(
        `${latestAnalytics.username}-github-analytics.json`,
        JSON.stringify(latestAnalytics, null, 2),
        "application/json"
    );
}

function downloadCsv() {
    if (!latestAnalytics || !latestAnalytics.repositories) return;

    const rows = [
        ["name", "language", "stars", "forks", "commits", "updated_at", "url"],
        ...latestAnalytics.repositories.top_starred.map(repo => [
            repo.name,
            repo.language,
            repo.stars,
            repo.forks,
            repo.commits,
            repo.updated_at,
            repo.url
        ])
    ];

    const csv = rows
        .map(row => row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    downloadFile(
        `${latestAnalytics.username}-top-repositories.csv`,
        csv,
        "text/csv"
    );
}

async function copySummary() {
    if (!latestAnalytics) return;
    const profileName = latestAnalytics.profile.name || latestAnalytics.profile.login || latestAnalytics.username;
    const summary = `${profileName}: ${latestAnalytics.total_contributions.toLocaleString()} contributions, ${latestAnalytics.current_streak}-day current streak, top language ${latestAnalytics.top_language}, ${latestAnalytics.repository_overview.total_stars} total stars.`;
    try {
        await navigator.clipboard.writeText(summary);
        const btn = document.getElementById("copyBtn");
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span style="color:#10b981;">✓ Copied!</span>`;
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
    } catch (err) {
        console.error("Failed to copy summary", err);
    }
}

function quickSearch(username) {
    const input = document.getElementById("username");
    if (input) {
        input.value = username;
        analyze();
    }
}

const chartColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#f43f5e"
];

const chartFont = {
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    size: 11
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
            labels: {
                color: "#94a3b8",
                font: chartFont
            }
        },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            titleColor: "#f8fafc",
            bodyColor: "#cbd5e1",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            titleFont: { weight: 600 }
        }
    },
    scales: {
        x: {
            ticks: {
                color: "#64748b",
                font: chartFont
            },
            grid: {
                color: "rgba(255, 255, 255, 0.04)"
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: "#64748b",
                font: chartFont,
                precision: 0
            },
            grid: {
                color: "rgba(255, 255, 255, 0.04)"
            }
        }
    }
};

function renderActivityChart(type) {
    if (!latestAnalytics) return;
    const canvas = document.getElementById("activityChart");
    if (!canvas) return;

    if (activityChart) {
        activityChart.destroy();
    }

    if (type === "monthly" && latestAnalytics.contribution_trend) {
        activityChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: Object.keys(latestAnalytics.contribution_trend),
                datasets: [{
                    label: "Contributions",
                    data: Object.values(latestAnalytics.contribution_trend),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.12)",
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointBackgroundColor: "#3b82f6",
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: baseOptions
        });
    } else if (type === "weekday" && latestAnalytics.weekday_activity) {
        activityChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: Object.keys(latestAnalytics.weekday_activity),
                datasets: [{
                    label: "Contributions",
                    data: Object.values(latestAnalytics.weekday_activity),
                    backgroundColor: "#60a5fa",
                    borderRadius: 6
                }]
            },
            options: baseOptions
        });
    } else if (type === "overview") {
        activityChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: ["Total Commits", "Longest Streak", "Current Streak", "Active Days"],
                datasets: [{
                    data: [
                        latestAnalytics.total_contributions,
                        latestAnalytics.longest_streak.days,
                        latestAnalytics.current_streak,
                        latestAnalytics.active_days
                    ],
                    backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
                    borderRadius: 6
                }]
            },
            options: baseOptions
        });
    }
}

function switchActivityTab(type, btnElement) {
    const parent = btnElement.closest(".tab-group");
    parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
    renderActivityChart(type);
}

function renderCodeChart(type) {
    if (!latestAnalytics) return;
    const canvas = document.getElementById("codeChart");
    if (!canvas) return;

    if (codeChart) {
        codeChart.destroy();
    }

    if (type === "languages" && latestAnalytics.languages) {
        const labels = Object.keys(latestAnalytics.languages);
        const data = Object.values(latestAnalytics.languages);

        codeChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors,
                    borderWidth: 2,
                    borderColor: "#0f172a"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        display: true,
                        position: "right",
                        labels: {
                            color: "#94a3b8",
                            font: chartFont,
                            boxWidth: 12,
                            padding: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        titleColor: "#f8fafc",
                        bodyColor: "#cbd5e1",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                }
            }
        });
    } else if (type === "stars" && latestAnalytics.repositories) {
        const repos = latestAnalytics.repositories.top_starred.slice(0, 5);
        codeChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: repos.map(r => r.name),
                datasets: [{
                    label: "Stars",
                    data: repos.map(r => r.stars),
                    backgroundColor: "#eab308",
                    borderRadius: 6
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: "y"
            }
        });
    } else if (type === "commits" && latestAnalytics.repositories) {
        const repos = latestAnalytics.repositories.top_committed.slice(0, 5);
        codeChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: repos.map(r => r.name),
                datasets: [{
                    label: "Commits",
                    data: repos.map(r => r.commits),
                    backgroundColor: "#8b5cf6",
                    borderRadius: 6
                }]
            },
            options: {
                ...baseOptions,
                indexAxis: "y"
            }
        });
    }
}

function switchCodeTab(type, btnElement) {
    const parent = btnElement.closest(".tab-group");
    parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
    renderCodeChart(type);
}

async function analyze() {
    const usernameInput = document.getElementById("username");
    const username = usernameInput ? usernameInput.value.trim() : "";
    const months = document.getElementById("months").value;

    if (!username) {
        alert("Please enter a GitHub username to analyze");
        if (usernameInput) usernameInput.focus();
        return;
    }

    const loader = document.getElementById("loader");
    const dashboard = document.getElementById("dashboard");
    const analyzeBtn = document.getElementById("analyzeBtn");

    if (analyzeBtn) analyzeBtn.disabled = true;
    loader.classList.remove("hidden");
    dashboard.innerHTML = "";

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/analyze/${encodeURIComponent(username)}?months=${months}`
        );

        const data = await response.json();
        loader.classList.add("hidden");
        if (analyzeBtn) analyzeBtn.disabled = false;

        if (!data.success) {
            dashboard.innerHTML = `
                <div class="error-card">
                    <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                        <div class="error-title">Analysis Failed</div>
                        <div class="error-desc">${escapeHtml(data.message || "An unknown error occurred")}</div>
                    </div>
                </div>
            `;
            return;
        }

        latestAnalytics = data;

        const topRepoRows = (data.repositories.top_starred || [])
            .map(repo => `
                <tr>
                    <td>
                        <a href="${escapeHtml(repo.url)}" target="_blank" class="repo-name-link">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" style="color:#94a3b8">
                                <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                            </svg>
                            ${escapeHtml(repo.name)}
                        </a>
                    </td>
                    <td>
                        <span class="lang-indicator">
                            <span class="lang-dot"></span>
                            ${escapeHtml(repo.language || "Plain Text")}
                        </span>
                    </td>
                    <td>
                        <span class="stat-pill">
                            <span class="star-icon">★</span> ${repo.stars.toLocaleString()}
                        </span>
                    </td>
                    <td><span class="stat-pill">${repo.forks.toLocaleString()}</span></td>
                    <td><span class="stat-pill">${repo.commits.toLocaleString()}</span></td>
                    <td><span style="color:#64748b; font-size:0.78rem;">${formatDate(repo.updated_at)}</span></td>
                </tr>
            `)
            .join("");

        dashboard.innerHTML = `
            <!-- Profile Card -->
            <div class="profile-card">
                <div class="profile-main">
                    <img 
                        class="profile-avatar"
                        src="${escapeHtml(data.profile.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')}"
                        alt="${escapeHtml(data.profile.login)}">
                    
                    <div class="profile-details">
                        <div class="profile-name-group">
                            <h2 class="profile-name">${escapeHtml(data.profile.name || data.profile.login)}</h2>
                            <span class="profile-login">@${escapeHtml(data.profile.login)}</span>
                        </div>
                        <p class="profile-bio">${escapeHtml(data.profile.bio || "No bio description provided.")}</p>
                        <div class="profile-meta-pills">
                            <span class="meta-pill"><strong>${data.profile.followers.toLocaleString()}</strong> followers</span>
                            <span class="meta-pill"><strong>${data.profile.following.toLocaleString()}</strong> following</span>
                            <span class="meta-pill"><strong>${data.profile.public_repositories.toLocaleString()}</strong> public repos</span>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <a href="${escapeHtml(data.profile.url)}" target="_blank" class="btn-secondary">
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        Profile
                    </a>
                    <button class="btn-secondary" id="copyBtn" onclick="copySummary()">
                        Copy
                    </button>
                    <button class="btn-secondary" onclick="downloadJson()">
                        JSON
                    </button>
                    <button class="btn-secondary" onclick="downloadCsv()">
                        CSV
                    </button>
                </div>
            </div>

            <!-- Consolidated 4-Metric Grid (Clean, High Signal) -->
            <div class="metrics-grid">
                <!-- 1. Contributions -->
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Contributions</span>
                        <span class="metric-badge badge-blue">${data.time_range_months} Mo</span>
                    </div>
                    <div class="metric-value">${data.total_contributions.toLocaleString()}</div>
                    <div class="metric-sub">${data.active_days} active days • ${data.average_per_active_day} avg/day</div>
                </div>

                <!-- 2. Streaks -->
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Activity Streak</span>
                        <span class="metric-badge badge-emerald">Current</span>
                    </div>
                    <div class="metric-value">${data.current_streak} <span style="font-size:1.1rem; font-weight:500; color:#94a3b8;">Days</span></div>
                    <div class="metric-sub">Longest: ${data.longest_streak.days} days (${formatDate(data.longest_streak.start)} – ${formatDate(data.longest_streak.end)})</div>
                </div>

                <!-- 3. Repository Reach -->
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Impact & Stars</span>
                        <span class="metric-badge badge-amber">Public</span>
                    </div>
                    <div class="metric-value">${data.repository_overview.total_stars.toLocaleString()} <span style="font-size:1.1rem; color:#eab308;">★</span></div>
                    <div class="metric-sub">${data.repository_overview.total_forks.toLocaleString()} forks across ${data.repository_overview.analyzed_count} repos</div>
                </div>

                <!-- 4. Top Language & Peak -->
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Top Language</span>
                        <span class="metric-badge badge-indigo">Stack</span>
                    </div>
                    <div class="metric-value" style="font-size:1.55rem;">${escapeHtml(data.top_language || "N/A")}</div>
                    <div class="metric-sub">Peak month: ${escapeHtml(data.most_active_month || "N/A")}</div>
                </div>
            </div>

            <!-- Tabbed Charts Section (2 Clean Cards, 0 Clutter) -->
            <div class="charts-row">
                <!-- Activity Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <span class="chart-title">Activity & Contributions</span>
                        <div class="tab-group">
                            <button class="tab-btn active" onclick="switchActivityTab('monthly', this)">Monthly</button>
                            <button class="tab-btn" onclick="switchActivityTab('weekday', this)">Weekday</button>
                            <button class="tab-btn" onclick="switchActivityTab('overview', this)">Overview</button>
                        </div>
                    </div>
                    <div class="chart-body">
                        <canvas id="activityChart"></canvas>
                    </div>
                </div>

                <!-- Code & Repo Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <span class="chart-title">Code & Repositories</span>
                        <div class="tab-group">
                            <button class="tab-btn active" onclick="switchCodeTab('languages', this)">Languages</button>
                            <button class="tab-btn" onclick="switchCodeTab('stars', this)">Stars</button>
                            <button class="tab-btn" onclick="switchCodeTab('commits', this)">Commits</button>
                        </div>
                    </div>
                    <div class="chart-body">
                        <canvas id="codeChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Top Starred Repositories Table -->
            <div class="table-card">
                <div class="table-header">
                    <span class="table-title">Top Starred Repositories</span>
                    <span class="table-count-badge">${(data.repositories.top_starred || []).length} Repositories</span>
                </div>
                <div class="table-scroll">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Repository</th>
                                <th>Language</th>
                                <th>Stars</th>
                                <th>Forks</th>
                                <th>Commits</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topRepoRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Render initial active charts
        renderActivityChart("monthly");
        renderCodeChart("languages");

    } catch (error) {
        loader.classList.add("hidden");
        if (analyzeBtn) analyzeBtn.disabled = false;
        dashboard.innerHTML = `
            <div class="error-card">
                <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                    <div class="error-title">Connection Error</div>
                    <div class="error-desc">Unable to connect to the backend server at http://127.0.0.1:8000. Ensure the FastAPI backend is running.</div>
                </div>
            </div>
        `;
        console.error(error);
    }
}
