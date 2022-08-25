// import axios from "axios";

const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const ALL_PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
// const SPECIFIC_PLAYER_BASE_URL = "https://www.balldontlie.io/api/v1/players/";
const TOTAL_PLAYERS = 3758;
// Write your code here.
const listOfPlayers = document.querySelector(".list-of-players");
const selectedStat = document.getElementById("stats");

selectedStat.addEventListener("change", () => {
  console.log(selectedStat.value);
});
function displayList() {
  if (listOfPlayers.hasChildNodes() === true) {
    listOfPlayers.style.display = "flex";
  }
}

async function getPlayerStats(playerID, season = 2021) {
  const url = new URL(SEASON_AVERAGE_BASE_URL);
  url.searchParams.set("player_ids[]", playerID);
  url.searchParams.set("season", `${season}`);
  try {
    const response = await fetch(url);
    const playerStats = await response.json();
    return playerStats;
  } catch (error) {
    console.error("oh no: " + error);
  }
}

async function getPlayersByNameAndID(playerName) {
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

const playersByNameAndID = await getPlayersByNameAndID("curry");
console.log(playersByNameAndID);
const playerStats = await getPlayerStats(playersByNameAndID[6].id);
console.log(playerStats.data[0]["pts"]);
