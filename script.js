// import axios from "axios";

const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";
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

async function getPlayerStats() {
  const url = new URL(SEASON_AVERAGE_BASE_URL);
  const player_ids = Array.from(Array(1200).keys());
  url.searchParams.set("player_ids[]", player_ids.join(","));
  url.searchParams.set("season", "2021");
  try {
    const response = await fetch(url);
    const playerStats = await response.json();
    return playerStats;
  } catch (error) {
    console.error("oh no: " + error);
  }
}

async function getAllPlayers(page) {
  const playersUrl = new URL(PLAYERS_BASE_URL);
  playersUrl.searchParams.set("page", `${page}`);
  try {
    const response = await fetch(playersUrl);
    const players = await response.json();
    return players;
  } catch (error) {
    console.log("oops" + error);
  }
}

const playerStats = await getPlayerStats();
