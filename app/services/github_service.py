import requests
from dotenv import load_dotenv
import os

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

URL = "https://api.github.com/graphql"

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}"
}

def run_query(query):

    response = requests.post(URL,json={"query": query},headers=HEADERS)

    return response.json()


def get_contributions(username, start_date, end_date):

    query = f"""
    {{
      user(login: "{username}") {{
        contributionsCollection(
          from: "{start_date}"
          to: "{end_date}"
        ) {{
          contributionCalendar {{
            totalContributions

            weeks {{
              contributionDays {{
                date
                contributionCount
              }}
            }}
          }}
        }}
      }}
    }}
    """

    return run_query(query)


def get_repositories(username):

    query = f"""
    {{
      user(login: "{username}") {{
        name
        login
        bio
        avatarUrl
        url
        followers {{
          totalCount
        }}
        following {{
          totalCount
        }}
        repositories(
          first: 100,
          ownerAffiliations: OWNER,
          orderBy: {{
            field: UPDATED_AT,
            direction: DESC
          }}
        ) {{

          totalCount

          nodes {{

            name
            description
            url
            updatedAt
            forkCount

            stargazerCount

            primaryLanguage {{
              name
            }}

            languages(first: 10) {{
              edges {{
                size
                node {{
                  name
                }}
              }}
            }}

            defaultBranchRef {{
              target {{

                ... on Commit {{

                  history(first: 1) {{
                    totalCount
                  }}

                }}

              }}
            }}

          }}
        }}
      }}
    }}
    """

    return run_query(query)

