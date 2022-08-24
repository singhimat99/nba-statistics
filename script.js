const SEASON_AVERAGE_BASE_URL =
  "https://www.balldontlie.io/api/v1/season_averages?player_ids[]=1,2,3,4,5,6&season=2021";
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
  // const url = new URL(SEASON_AVERAGE_BASE_URL);
  // url.searchParams.set("season", "2019");
  // url.searchParams.set("players[]", "1,2,3,4");
  try {
    const response = await fetch(SEASON_AVERAGE_BASE_URL);
    const obj = await response.json();
    console.log(obj);
  } catch (error) {
    console.error("oh no: " + error);
  }
}
getPlayers();
