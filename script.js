const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
const ALL_SEASON_STATS_BASE_URL = "https://www.balldontlie.io/api/v1/stats";
const TEAMS_BASE_URL = "https://www.balldontlie.io/api/v1/teams";
const TOTAL_PLAYERS = 3758;
let timeoutID;
const playerNameInput = document.getElementById("player-name");
const suggestionsList = document.querySelector(".suggestions-list");
const getAvgsButton = document.querySelector(".getAvgs");
const playerInfo = document.querySelectorAll(".info");
const statsBody = document.querySelector(".statsBody");
let currentPlayerID = 0;
let currentPlayerName = null;
const season = document.getElementById("season");
const getStatsButton = document.querySelector(".getStats");
const gamesWrapper = document.querySelector(".scrollable-wrapper");
const seasonStatsWrapper = document.querySelector(".season-stats-wrapper");
const headingWrapper = document.querySelector(".header");

getStatsButton.addEventListener("click", () => {
  appendGames();
});
season.addEventListener("change", () => {
  getAvgsButton.disabled = false;
  getAvgsButton.style.filter = "brightness(100%)";
  hideSeasonAndResetStats();
});
getAvgsButton.addEventListener("click", () => {
  appendStats();
});

// SUGGESTIONS LIST
playerNameInput.addEventListener("input", () => {
  getAvgsButton.disabled = false;
  getAvgsButton.style.filter = "brightness(100%)";
  onType();
  hideSeasonAndResetStats();
});

function onType() {
  if (playerNameInput.value.length < 3) {
    clearSuggestions();
    return;
  }
  console.log(currentPlayerID, currentPlayerName);
  clearTimeout(timeoutID);
  timeoutID = setTimeout(fetchAndAppendSuggestions, 100);
}

async function fetchAndAppendSuggestions() {
  const players = await getPlayersByName(playerNameInput.value);
  const playerIDs = players.map((player) => {
    return player.id;
  });
  const suggestions = await filterBySeason(playerIDs.join(","));
  const fragment = document.createDocumentFragment();
  suggestions.forEach((suggestion) => {
    fragment.appendChild(createSuggestionElement(suggestion));
  });
  suggestionsList.replaceChildren(fragment);
}

async function filterBySeason(playerIDs) {
  const filteredPlayersStats = await getPlayerStats(playerIDs, season.value);
  const filteredIDs = filteredPlayersStats.map((stateroos) => {
    return stateroos.player_id;
  });
  const filteredPlayersNames = [];
  for (let i = 0; i < filteredIDs.length; i++) {
    const name = await fetchPlayerNameByID(filteredIDs[i]);
    filteredPlayersNames.push(name);
  }
  return filteredPlayersNames;
}

async function fetchPlayerNameByID(id) {
  try {
    const response = await fetch(
      `https://www.balldontlie.io/api/v1/players/${id}`
    );
    const playerName = await response.json();
    return `${playerName.first_name} ${playerName.last_name}`;
  } catch (error) {
    console.log(`filter error: ${error}`);
  }
}
function createSuggestionElement(suggestion) {
  const li = document.createElement("li");
  li.textContent = suggestion;
  li.addEventListener("click", () => {
    playerNameInput.value = suggestion;
    clearSuggestions();
  });
  return li;
}
function clearSuggestions() {
  clearTimeout(timeoutID);
  suggestionsList.innerHTML = "";
  currentPlayerID = 0;
  currentPlayerName = null;
}

// GET AND APPEND PLAYERS STATS
async function getPlayerStats(playerID, season = 2021) {
  const url = new URL(SEASON_AVERAGE_BASE_URL);
  url.searchParams.set("player_ids[]", playerID);
  url.searchParams.set("season", `${season}`);
  try {
    const response = await fetch(url);
    const playerStats = await response.json();
    return playerStats.data;
  } catch (error) {
    console.error("oh no: " + error);
  }
}

async function getPlayersByName(playerName) {
  const playersUrl = new URL(ALL_PLAYERS_BASE_URL);
  playersUrl.searchParams.set("search", `${playerName}`);
  try {
    const response = await fetch(playersUrl);
    const players = await response.json();
    return players.data.map((player) => {
      return {
        name: `${player.first_name} ${player.last_name}`,
        id: player.id,
      };
    });
  } catch (error) {
    console.log("oops" + error);
  }
}

async function validateInput(input) {
  const playersByName = await getPlayersByName(input);
  if (playersByName.length < 1) return false;
  const players = playersByName.filter((name) => {
    if (name.name.toLowerCase() === input.toLowerCase()) return name.name;
  });
  if (players.length < 1) return false;
  return true;
}

async function appendStats() {
  statsBody.innerHTML = "";

  playerInfo.forEach((element) => {
    if (element.children.length < 2) return;
    element.lastChild.remove();
  });

  getAvgsButton.disabled = true;
  getAvgsButton.style.filter = "brightness(45%)";

  const input = playerNameInput.value;
  if ((await validateInput(input)) === false) return;

  displaySeasonStats();

  const player = await getPlayersByName(input);
  const { name: playerName, id: playerID } = player[0];
  currentPlayerID = playerID;
  currentPlayerName = playerName;
  const playerStats = await getPlayerStats(playerID, season.value);

  const infoCategories = [playerName, "season", "games_played"];
  const statCategories = ["pts", "ast", "reb", "stl", "blk"];

  const tr = document.createElement("tr");
  tr.setAttribute("class", "statisticsRow");

  infoCategories.forEach((info, i) => {
    const p = document.createElement("p");
    if (i === 0) {
      p.textContent = info;
      playerInfo[i].appendChild(p);
      return;
    }
    p.textContent = playerStats[0][info];
    playerInfo[i].appendChild(p);
  });

  statCategories.forEach((category) => {
    const td = document.createElement("td");
    td.className = category;
    td.textContent = playerStats[0][category];
    tr.appendChild(td);
  });

  statsBody.appendChild(tr);
  console.log(currentPlayerID, currentPlayerName);
}

// APPEND SEASON STATS

/* <div class="game">
    <h4>Lebron James</h4>
    <h5>Lakers vs Warriors</h5>
    <p><b>30</b> Points <b>30</b> Rebounds <b>30</b> Assists <b>30</b> Steals <b>30</b> Blocks</p>
  </div> */

async function appendGames() {
  const gamesSeason = season.value;
  const { data: games, meta } = await fetchAllGamesBySeason(
    currentPlayerID,
    gamesSeason
  );
  const teams = await getAllTeams();
  const playerName = playerNameInput.value;
  const playerHeader = document.createElement("h4");
  playerHeader.textContent = `${playerName} ${gamesSeason} Season Stats`;
  headingWrapper.appendChild(playerHeader);
  const fragment = document.createDocumentFragment();
  games.forEach((game) => {
    fragment.appendChild(createGameElement(game, teams));
  });
  gamesWrapper.appendChild(fragment);
}
async function fetchAllGamesBySeason(playerID, currentSeason) {
  const url = new URL(ALL_SEASON_STATS_BASE_URL);
  url.searchParams.set("seasons", currentSeason);
  url.searchParams.set("player_ids", playerID);
  try {
    const response = await fetch(url);
    const allGames = await response.json();
    return allGames;
  } catch (error) {
    console.error("error alert" + error);
  }
}

// const { data: games, meta } = await fetchAllGamesBySeason(237, 2018);
// console.log(games);
// console.log(meta);
function createGameElement(game, teams) {
  const gameWrapper = document.createElement("div");
  gameWrapper.classList.add("game");
  const versusHeading = document.createElement("h5");
  versusHeading.textContent = `${
    game.game.home_team_id === game.team.id ? "VS" : "@"
  } ${
    game.game.home_team_id === game.team.id
      ? teams[game.game.visitor_team_id - 1]
      : teams[game.game.home_team_id - 1]
  }`;
  const statsDisplay = document.createElement("p");
  statsDisplay.innerHTML = `<b>${game.pts}</b> Points <b>${game.reb}</b> Rebounds <b>${game.ast}</b> Assists <b>${game.stl}</b> Steals <b>${game.blk}</b> Blocks`;
  gameWrapper.appendChild(versusHeading);
  gameWrapper.appendChild(statsDisplay);
  return gameWrapper;
}
async function getAllTeams() {
  try {
    const response = await fetch(TEAMS_BASE_URL);
    const teamsData = await response.json();
    return teamsData.data.map((team) => {
      return team["full_name"];
    });
  } catch (error) {
    console.log(error);
  }
}
const teameroor = await getAllTeams();
console.log(teameroor);
function hideSeasonAndResetStats() {
  seasonStatsWrapper.style.display = "none";
  gamesWrapper.innerHTML = "";
  headingWrapper.innerHTML = "";
}
function displaySeasonStats() {
  seasonStatsWrapper.style.display = "flex";
}
