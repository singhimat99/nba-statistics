const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages";
const PLAYERS_BASE_URL = "https://www.balldontlie.io/api/v1/players";

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

async function getPlayers() {
  try {
    const response = await fetch(PLAYERS_BASE_URL);
    const obj = await response.json();
    console.log(obj);
  } catch (error) {
    console.error("oh no: " + error);
  }
}
getPlayers();
