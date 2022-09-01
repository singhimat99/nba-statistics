const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
// const SPECIFIC_PLAYER_BASE_URL = "https://www.balldontlie.io/api/v1/players/";
const TOTAL_PLAYERS = 3758;
// Write your code here.
const playerNameInput = document.getElementById("player-name");
const getStatsButton = document.querySelector(".getStats");
const statsBody = document.querySelector(".statsBody");
const playerInfo = document.querySelectorAll(".info");
getStatsButton.addEventListener("click", appendStats);

async function getPlayerStats(playerID, season = 2021) {
  const url = new URL(SEASON_AVERAGE_BASE_URL);
  url.searchParams.set("player_ids[]", playerID);
  url.searchParams.set("season", `${season}`);
  try {
    const response = await fetch(url);
    const playerStats = await response.json();
    return playerStats.data[0]; // normal is an object with a data array
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
    if (name.name.toLowerCase() === input) return name.name;
  });
  if (players.length < 1) return false;
  return true;
}
console.log(await validateInput("Stephen curry"));
const playerStats = await getPlayerStats(237);
console.log(playerStats);

async function appendStats() {
  // clear any stats already appended if true
  statsBody.innerHTML = "";
  playerInfo.forEach((element) => {
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
  const playerStats = await getPlayerStats(playerID);

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
    p.textContent = playerStats[info];
    playerInfo[i].appendChild(p);
  });
  statCategories.forEach((category) => {
    const td = document.createElement("td");
    td.className = category;
    td.textContent = playerStats[category];
    tr.appendChild(td);
  });
  statsBody.appendChild(tr);
}
