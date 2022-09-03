const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
const TOTAL_PLAYERS = 3758;
let timeoutID;
const playerNameInput = document.getElementById("player-name");
const getAvgsButton = document.querySelector(".getAvgs");
const statsBody = document.querySelector(".statsBody");
const playerInfo = document.querySelectorAll(".info");
const suggestionsList = document.querySelector(".suggestions-list");
const season = document.getElementById("season");
let currentPlayerID = 0;
let currentPlayerName = null;
season.addEventListener("change", () => {
  getAvgsButton.disabled = false;
});
getAvgsButton.addEventListener("click", appendStats);

// SUGGESTIONS LIST
playerNameInput.addEventListener("input", () => {
  getAvgsButton.disabled = false;
  onType();
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

  const input = playerNameInput.value;
  if ((await validateInput(input)) === false) return;

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

function clearSeasonStats() {}

async function getGamesByPlayerID(id) {}
console.log(currentPlayerID, currentPlayerName);
