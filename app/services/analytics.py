from datetime import datetime, timedelta
import pandas as pd

from app.services.github_service import (
    get_contributions,
    get_repositories
)


# ==========================
# FLATTEN CONTRIBUTION DATA
# ==========================

def flatten_days(contribution_response):

    weeks = (
        contribution_response["data"]
        ["user"]
        ["contributionsCollection"]
        ["contributionCalendar"]
        ["weeks"]
    )

    days = []

    for week in weeks:
        days.extend(week["contributionDays"])

    return days


# ==========================
# LONGEST STREAK
# ==========================

def longest_streak(days):

    current = 0
    maximum = 0

    start = None
    end = None

    temp_start = None

    for day in days:

        if day["contributionCount"] > 0:

            current += 1

            if current == 1:
                temp_start = day["date"]

            if current > maximum:
                maximum = current
                start = temp_start
                end = day["date"]

        else:
            current = 0

    return {
        "streak": maximum,
        "start": start,
        "end": end
    }


# ==========================
# MOST ACTIVE MONTH
# ==========================

def most_active_month(days):

    df = pd.DataFrame(days)

    df["date"] = pd.to_datetime(df["date"])

    df["month"] = df["date"].dt.strftime("%B %Y")

    result = (
        df.groupby("month")["contributionCount"]
        .sum()
        .sort_values(ascending=False)
    )

    return result.index[0]


# ==========================
# LANGUAGE STATS
# ==========================

def language_stats(repositories):

    languages = {}

    for repo in repositories:

        if not repo.get("languages"):
            continue

        for lang in repo["languages"]["edges"]:

            name = lang["node"]["name"]
            size = lang["size"]

            languages[name] = (
                languages.get(name, 0) + size
            )

    if not languages:
        return "Unknown"

    return max(
        languages,
        key=languages.get
    )


# ==========================
# MOST WORKED REPO
# ==========================
def most_worked_repo(repositories):

    repo_name = None
    max_commits = 0

    for repo in repositories:

        commit_count = 0

        try:

            commit_count = (
                repo["defaultBranchRef"]
                ["target"]
                ["history"]
                ["totalCount"]
            )

        except:
            pass

        if commit_count > max_commits:

            max_commits = commit_count
            repo_name = repo["name"]

    return {
        "repository": repo_name,
        "commits": max_commits
    }




# ==========================
# MAIN ANALYTICS PIPELINE
# ==========================

def analytics_pipeline(
    username: str,
    months: int = 12
):

    try:

        end_date = datetime.utcnow()

        start_date = (
            end_date -
            timedelta(days=months * 30)
        )

        start_date = (
            start_date.isoformat() + "Z"
        )

        end_date = (
            end_date.isoformat() + "Z"
        )

        # ==================
        # Contributions
        # ==================

        contributions = get_contributions(
            username,
            start_date,
            end_date
        )

        if "errors" in contributions:

            return {
                "success": False,
                "message":
                contributions["errors"][0]["message"]
            }

        total_contributions = (
            contributions["data"]
            ["user"]
            ["contributionsCollection"]
            ["contributionCalendar"]
            ["totalContributions"]
        )

        days = flatten_days(
            contributions
        )

        streak_data = longest_streak(
            days
        )

        active_month = most_active_month(
            days
        )

        # ==================
        # Repositories
        # ==================

        repo_data = get_repositories(
            username
        )

        if "errors" in repo_data:

            return {
                "success": False,
                "message":
                repo_data["errors"][0]["message"]
            }

        repositories = (
            repo_data["data"]
            ["user"]
            ["repositories"]
            ["nodes"]
        )

        language = language_stats(
            repositories
        )

        repository = most_worked_repo(
            repositories
        )

        # ==================
        # Final Response
        # ==================

        return {

            "success": True,

            "username": username,

            "time_range_months": months,

            "total_contributions":
            total_contributions,

            "longest_streak": {

                "days":
                streak_data["streak"],

                "start":
                streak_data["start"],

                "end":
                streak_data["end"]
            },

            "most_active_month":
            active_month,

            "most_worked_repository": {
            "name": repository["repository"],
            "commit_count": repository["commits"]
            },

            "top_language":
            language
        }

    except Exception as e:

        return {

            "success": False,
            "message": str(e)
        }
