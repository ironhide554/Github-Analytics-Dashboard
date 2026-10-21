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

    df["month_key"] = df["date"].dt.to_period("M")

    result = (
        df.groupby("month_key")["contributionCount"]
        .sum()
        .sort_values(ascending=False)
    )

    return result.index[0].strftime("%B %Y")


# ==========================
# CONTRIBUTION BREAKDOWNS
# ==========================

def contribution_breakdowns(days):

    df = pd.DataFrame(days)

    if df.empty:

        return {
            "monthly": {},
            "weekday": {},
            "active_days": 0,
            "average_per_active_day": 0,
            "current_streak": 0
        }

    df["date"] = pd.to_datetime(df["date"])

    monthly_result = (
        df.assign(month=df["date"].dt.to_period("M"))
        .groupby("month")["contributionCount"]
        .sum()
        .sort_index()
    )

    monthly = {
        month.strftime("%b %Y"): int(total)
        for month, total in monthly_result.items()
    }

    weekday_order = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ]

    weekday_result = (
        df.assign(weekday=df["date"].dt.strftime("%a"))
        .groupby("weekday")["contributionCount"]
        .sum()
        .reindex(weekday_order, fill_value=0)
    )

    weekday = {
        day: int(total)
        for day, total in weekday_result.items()
    }

    active_days = int(
        (df["contributionCount"] > 0).sum()
    )

    total_contributions = int(
        df["contributionCount"].sum()
    )

    average_per_active_day = (
        round(total_contributions / active_days, 1)
        if active_days else 0
    )

    current_streak = 0

    for contribution_count in reversed(
        df.sort_values("date")["contributionCount"].tolist()
    ):

        if contribution_count > 0:
            current_streak += 1
        else:
            break

    return {
        "monthly": monthly,
        "weekday": weekday,
        "active_days": active_days,
        "average_per_active_day": average_per_active_day,
        "current_streak": current_streak
    }


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

        return {
            "top_language": "Unknown",
            "languages": {}
        }

    top_language = max(
        languages,
        key=languages.get
    )

    return {
        "top_language": top_language,
        "languages": languages
    }

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
# REPOSITORY RANKINGS
# ==========================

def repository_rankings(repositories):

    ranked = []

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

        ranked.append({
            "name": repo["name"],
            "description": repo.get("description"),
            "url": repo.get("url"),
            "stars": repo.get("stargazerCount", 0),
            "forks": repo.get("forkCount", 0),
            "updated_at": repo.get("updatedAt"),
            "language": (
                repo.get("primaryLanguage") or {}
            ).get("name", "Unknown"),
            "commits": commit_count
        })

    top_starred = sorted(
        ranked,
        key=lambda repo: repo["stars"],
        reverse=True
    )[:5]

    top_committed = sorted(
        ranked,
        key=lambda repo: repo["commits"],
        reverse=True
    )[:5]

    return {
        "top_starred": top_starred,
        "top_committed": top_committed
    }


# ==========================
# REPOSITORY OVERVIEW
# ==========================

def repository_overview(repositories):

    total_stars = sum(
        repo.get("stargazerCount", 0)
        for repo in repositories
    )

    total_forks = sum(
        repo.get("forkCount", 0)
        for repo in repositories
    )

    total_commits = 0

    for repo in repositories:

        try:

            total_commits += (
                repo["defaultBranchRef"]
                ["target"]
                ["history"]
                ["totalCount"]
            )

        except:
            pass

    recently_updated = sorted(
        repositories,
        key=lambda repo: repo.get("updatedAt") or "",
        reverse=True
    )

    latest_repo = recently_updated[0] if recently_updated else {}

    return {
        "analyzed_count": len(repositories),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_commits": total_commits,
        "average_stars": (
            round(total_stars / len(repositories), 1)
            if repositories else 0
        ),
        "recently_updated": {
            "name": latest_repo.get("name"),
            "url": latest_repo.get("url"),
            "updated_at": latest_repo.get("updatedAt")
        }
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

        if "message" in contributions:
            return {
                "success": False,
                "message": f"GitHub API error: {contributions['message']}. Please verify your GITHUB_TOKEN in .env."
            }

        if "errors" in contributions:
            return {
                "success": False,
                "message": contributions["errors"][0]["message"]
            }

        if not contributions.get("data") or not contributions["data"].get("user"):
            return {
                "success": False,
                "message": f"GitHub user '{username}' was not found or has no accessible activity."
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

        contribution_data = contribution_breakdowns(
            days
        )

        # ==================
        # Repositories
        # ==================

        repo_data = get_repositories(
            username
        )

        if "message" in repo_data:
            return {
                "success": False,
                "message": f"GitHub API error: {repo_data['message']}. Please verify your GITHUB_TOKEN in .env."
            }

        if "errors" in repo_data:
            return {
                "success": False,
                "message": repo_data["errors"][0]["message"]
            }

        if not repo_data.get("data") or not repo_data["data"].get("user"):
            return {
                "success": False,
                "message": f"Repositories for GitHub user '{username}' could not be loaded."
            }

        user_data = (
            repo_data["data"]
            ["user"]
        )

        repositories = (
            user_data
            ["repositories"]
            ["nodes"]
        )

        language_data = language_stats(
            repositories
        )

        repository = most_worked_repo(
            repositories
        )

        repo_rankings = repository_rankings(
            repositories
        )

        repo_overview = repository_overview(
            repositories
        )

        # ==================
        # Final Response
        # ==================

        return {

            "success": True,

            "username": username,

            "profile": {
                "name": user_data.get("name"),
                "login": user_data.get("login"),
                "bio": user_data.get("bio"),
                "avatar_url": user_data.get("avatarUrl"),
                "url": user_data.get("url"),
                "followers": (
                    user_data.get("followers") or {}
                ).get("totalCount", 0),
                "following": (
                    user_data.get("following") or {}
                ).get("totalCount", 0),
                "public_repositories": (
                    user_data.get("repositories") or {}
                ).get("totalCount", 0)
            },

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

            "current_streak":
            contribution_data["current_streak"],

            "active_days":
            contribution_data["active_days"],

            "average_per_active_day":
            contribution_data["average_per_active_day"],

            "most_worked_repository": {
            "name": repository["repository"],
            "commit_count": repository["commits"]
            },

            "top_language":
            language_data["top_language"],

            "languages":
            language_data["languages"],

            "contribution_trend":
            contribution_data["monthly"],

            "weekday_activity":
            contribution_data["weekday"],

            "repositories":
            repo_rankings,

            "repository_overview":
            repo_overview,
        }

    except Exception as e:

        return {

            "success": False,
            "message": str(e)
        }
