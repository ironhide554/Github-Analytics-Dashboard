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

        </div>
        `;

        if(data.languages){

            new Chart(
                document.getElementById("langChart"),
                {
                    type:"doughnut",
                    data:{
                        labels:Object.keys(data.languages),
                        datasets:[{
                            data:Object.values(data.languages)
                        }]
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
                        "Longest Streak"
                    ],
                    datasets:[{
                        data:[
                            data.total_contributions,
                            data.longest_streak.days
                        ]
                    }]
                }
            }
        );

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
