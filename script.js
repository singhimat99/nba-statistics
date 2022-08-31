const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
// const SPECIFIC_PLAYER_BASE_URL = "https://www.balldontlie.io/api/v1/players/";
const TOTAL_PLAYERS = 3758;
// Write your code here.
const playerNameInput = document.getElementById("stats");
const getStatsButton = document.querySelector(".getStats");

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
    const playersInfo = players.data.map((player) => {
      return {
        name: `${player.first_name} ${player.last_name}`,
        id: player.id,
      };
    });
    return playersInfo;
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
// console.log(await validateInput("curry"));
// const playerStats = await getPlayerStats(playersByName[6].id);
// console.log(playerStats.data[0]["pts"]);

async function appendStats() {
  // clear any stats already appended if true

  // disable button

  // validate input
  const input = playerNameInput.value;
  if ((await validateInput(input)) === false) return;

  // get stats of player requested
  const player = await getPlayersByName(input);
  const { name: playerName, id: playerID } = player[0];
  const playerStats = await getPlayerStats(playerID);

  //append those stats to a fragement and then to the tr
}
