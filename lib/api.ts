const ESPN_NBA_BASE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba";

export const NBA_API = {
  scoreboard: `${ESPN_NBA_BASE_URL}/scoreboard`,
  news: `${ESPN_NBA_BASE_URL}/news`,
  teams: `${ESPN_NBA_BASE_URL}/teams`,
  team: (team: string) =>
    `${ESPN_NBA_BASE_URL}/teams/${encodeURIComponent(team)}`,
  summary: (gameId: string) =>
    `${ESPN_NBA_BASE_URL}/summary?event=${encodeURIComponent(gameId)}`,
} as const;

const ESPN_NCAA_BASE_URL = 
 "http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard"

export const NCAA_API = {
  scoreboard: `${ESPN_NCAA_BASE_URL}/scoreboard`,
  news: `${ESPN_NCAA_BASE_URL}/news`,
  teams: `${ESPN_NCAA_BASE_URL}/teams`,
  team: (team: string) =>
    `${ESPN_NCAA_BASE_URL}/teams/${encodeURIComponent(team)}`,
} as const;