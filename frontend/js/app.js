async function analyze() {

    const username =
        document.getElementById("username").value;

    const months =
        document.getElementById("months").value;

    if (!username) {

        alert("Please enter a GitHub username");
        return;
    }

    const loader =
        document.getElementById("loader");

    const dashboard =
        document.getElementById("dashboard");

    loader.classList.remove("hidden");

    dashboard.innerHTML = "";

    try {

        const response =
            await fetch(
                `http://127.0.0.1:8000/analyze/${username}?months=${months}`
            );

        const data =
            await response.json();

        loader.classList.add("hidden");

        if (!data.success) {

            dashboard.innerHTML =
                `<h2>${data.message}</h2>`;

            return;
        }

        dashboard.innerHTML = `

        <div class="cards">

            <div class="card">
                <h3>Total Contributions</h3>
                <h1>${data.total_contributions}</h1>
            </div>

            <div class="card">
                <h3>Longest Streak</h3>
                <h1>${data.longest_streak.days} Days</h1>
            </div>

            <div class="card">
                <h3>Current Streak</h3>
                <h1>${data.current_streak} Days</h1>
            </div>

            <div class="card">
                <h3>Active Days</h3>
                <h1>${data.active_days}</h1>
            </div>

            <div class="card">
                <h3>Avg. Per Active Day</h3>
                <h1>${data.average_per_active_day}</h1>
            </div>

            <div class="card">
                <h3>Most Active Month</h3>
                <h2>${data.most_active_month}</h2>
            </div>

            <div class="card">
                <h3>Top Language</h3>
                <h2>${data.top_language}</h2>
            </div>

            <div class="card">
                <h3>Most Worked Repository</h3>
                <h2>${data.most_worked_repository.name}</h2>
            </div>

            <div class="card">
                <h3>Total Repo Commits</h3>
                <h1>${data.most_worked_repository.commit_count}</h1>
            </div>

        </div>

        <div class="chart-section">

            <div class="chart-card">
                <h3>Language Distribution</h3>
                <canvas id="langChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Contribution Overview</h3>
                <canvas id="contributionChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Monthly Contribution Trend</h3>
                <canvas id="monthlyChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Weekday Activity</h3>
                <canvas id="weekdayChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Top Repositories by Stars</h3>
                <canvas id="repoStarsChart"></canvas>
            </div>

            <div class="chart-card">
                <h3>Top Repositories by Commits</h3>
                <canvas id="repoCommitsChart"></canvas>
            </div>

        </div>
        `;

        const chartColors = [
            "#60a5fa",
            "#34d399",
            "#f59e0b",
            "#f472b6",
            "#a78bfa",
            "#22d3ee",
            "#fb7185"
        ];

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#cbd5e1"
                    },
                    grid: {
                        color: "rgba(148,163,184,0.14)"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#cbd5e1",
                        precision: 0
                    },
                    grid: {
                        color: "rgba(148,163,184,0.14)"
                    }
                }
            }
        };

        if(data.languages){

            new Chart(
                document.getElementById("langChart"),
                {
                    type:"doughnut",
                    data:{
                        labels:Object.keys(data.languages),
                        datasets:[{
                            data:Object.values(data.languages),
                            backgroundColor: chartColors
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels: {
                                    color: "#e2e8f0"
                                }
                            }
                        }
                    }
                }
            );
        }

        new Chart(
            document.getElementById("contributionChart"),
            {
                type:"bar",
                data:{
                    labels:[
                        "Contributions",
                        "Longest Streak",
                        "Current Streak",
                        "Active Days"
                    ],
                    datasets:[{
                        label: "Count",
                        data:[
                            data.total_contributions,
                            data.longest_streak.days,
                            data.current_streak,
                            data.active_days
                        ],
                        backgroundColor: chartColors
                    }]
                },
                options: baseOptions
            }
        );

        if(data.contribution_trend){

            new Chart(
                document.getElementById("monthlyChart"),
                {
                    type:"line",
                    data:{
                        labels:Object.keys(data.contribution_trend),
                        datasets:[{
                            label:"Contributions",
                            data:Object.values(data.contribution_trend),
                            borderColor:"#34d399",
                            backgroundColor:"rgba(52,211,153,0.16)",
                            fill:true,
                            tension:0.35
                        }]
                    },
                    options: baseOptions
                }
            );
        }

        if(data.weekday_activity){

            new Chart(
                document.getElementById("weekdayChart"),
                {
                    type:"bar",
                    data:{
                        labels:Object.keys(data.weekday_activity),
                        datasets:[{
                            label:"Contributions",
                            data:Object.values(data.weekday_activity),
                            backgroundColor: chartColors
                        }]
                    },
                    options: baseOptions
                }
            );
        }

        if(data.repositories){

            new Chart(
                document.getElementById("repoStarsChart"),
                {
                    type:"bar",
                    data:{
                        labels:data.repositories.top_starred.map(
                            repo => repo.name
                        ),
                        datasets:[{
                            label:"Stars",
                            data:data.repositories.top_starred.map(
                                repo => repo.stars
                            ),
                            backgroundColor:"#f59e0b"
                        }]
                    },
                    options:{
                        ...baseOptions,
                        indexAxis:"y"
                    }
                }
            );

            new Chart(
                document.getElementById("repoCommitsChart"),
                {
                    type:"bar",
                    data:{
                        labels:data.repositories.top_committed.map(
                            repo => repo.name
                        ),
                        datasets:[{
                            label:"Commits",
                            data:data.repositories.top_committed.map(
                                repo => repo.commits
                            ),
                            backgroundColor:"#a78bfa"
                        }]
                    },
                    options:{
                        ...baseOptions,
                        indexAxis:"y"
                    }
                }
            );
        }

    } catch (error) {

        loader.classList.add("hidden");

        dashboard.innerHTML = `
        <h2>
        Error connecting to backend
        </h2>
        `;

        console.error(error);
    }
}
