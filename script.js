const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
const TOTAL_PLAYERS = 3758;
let timeoutID;
const playerNameInput = document.getElementById("player-name");
const getStatsButton = document.querySelector(".getStats");
const statsBody = document.querySelector(".statsBody");
const playerInfo = document.querySelectorAll(".info");
const suggestionsList = document.querySelector(".suggestions-list");
const season = document.getElementById("season");
season.addEventListener("change", () => {
  getStatsButton.disabled = false;
});
getStatsButton.addEventListener("click", appendStats);
playerNameInput.addEventListener("input", () => {
  getStatsButton.disabled = false;
  onType();
});

// SUGGESTIONS LIST
function onType() {
  if (playerNameInput.value.length === 0) {
    clearSuggestions();
    return;
  }
  clearTimeout(timeoutID);
  timeoutID = setTimeout(fetchAndAppendSuggestions, 300);
}
async function fetchAndAppendSuggestions() {
  const players = await getPlayersByName(playerNameInput.value);
  const playerIDs = players.map((player) => {
    return player.id;
  });
  const suggestions = await filterBySeason(playerIDs.join(","));
  // call get player stats with season of 2021, and it will return all the players
  const fragment = document.createDocumentFragment();
  suggestions.forEach((suggestion) => {
    fragment.appendChild(createSuggestionElement(suggestion));
  });
  suggestionsList.replaceChildren(fragment);
}

async function filterBySeason(playerIDs) {
  // should return an array of names of players that played in that season
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
}
// CODE TO GET PLAYERS STATS
async function getPlayerStats(playerID, season = 2021) {
  const url = new URL(SEASON_AVERAGE_BASE_URL);
  url.searchParams.set("player_ids[]", playerID);
  url.searchParams.set("season", `${season}`);
  try {
    const response = await fetch(url);
    const playerStats = await response.json();
    return playerStats.data; // normal is an object with a data array
  } catch (error) {
    console.error("oh no: " + error);
  }
}
// returns array of objects with that name plsu their IDs
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
// console.log(await validateInput("lebron James"));
// const playerStats = await getPlayerStats("233,237");
// console.log(playerStats);

async function appendStats() {
  // clear any stats already appended if true
  statsBody.innerHTML = "";
  playerInfo.forEach((element) => {
    if (element.children.length < 2) return;
    element.lastChild.remove();
  });
  // disable button
  getStatsButton.disabled = true;

  // validate input
  const input = playerNameInput.value;
  if ((await validateInput(input)) === false) return;

  // get stats of player requested
  const player = await getPlayersByName(input);
  const { name: playerName, id: playerID } = player[0];
  const playerStats = await getPlayerStats(playerID, season.value);

  //append those stats to a fragement and then to the tr
  const tr = document.createElement("tr");
  tr.setAttribute("class", "statisticsRow");
  const infoCategories = [playerName, "season", "games_played"];
  const statCategories = ["pts", "ast", "reb", "stl", "blk"];
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
}
