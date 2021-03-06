const API_URL = "https://cgi.arcada.fi/~lahepela/Startsida/wdbcms22-projekt-1-hardtimez/api/widgets";
const TODO_URL = "https://cgi.arcada.fi/~lahepela/Startsida/wdbcms22-projekt-1-hardtimez/api/todo";
const IP_URL = "https://cgi.arcada.fi/~kindstep/Startsida/wdbcms22-projekt-1-hardtimez/api/ip/";
let userId;

//////////// WIDGET API WIDGET API WIDGET API ////////////

async function getWidgets() {
  const resp = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'x-api-key': localStorage.getItem("apiKey")
    }
  });

  const respData = await resp.json();
  if (respData['error'] == "403") {
    console.log("invalid api key");
    document.querySelector('#errorText').innerHTML = "Invalid API key";
    getIP();
    getTodo();
  } else {
    userId = respData['id'];
    document.querySelector('#errorText').innerHTML = "";
    // run functions that require API key, get tokens from API
    getIP(respData['ip_token']);
    getTodo();
  }
}

function applyApi() {
  localStorage.setItem("apiKey", document.querySelector('#apiKey').value);
  getWidgets();
}
// Fyller i APIKEYN färdigt i fältet
if (localStorage.getItem("apiKey")) {
  document.querySelector('#apiKey').value = localStorage.getItem("apiKey");
}

///////////////// TODO API TODO API TODO API //////////////////

async function getTodo() {

  // Filter
  let filter = document.querySelector("#show").value;
  const resp = await fetch(TODO_URL + "?filter=" + filter, {
    method: 'GET',
    headers: {
      'x-api-key': localStorage.getItem("apiKey")
    }
  });
  const respData = await resp.json();
  if (respData['error'] == "403") {
    document.querySelector("#todoList").innerHTML = "";
    return;
  } else {

    let tasks_html = "";
    document.querySelector("#todoList").innerHTML = "";
    // Visa todona
    for (todo of respData.todo) {

      if (!todo.done) {
        tasks_html +=
          `<li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
        ${todo.title}
  <span class="badge bg-info rounded-pill mark">${todo.category_name}</span>
  </div>
    <div>
    <span class="badge rounded-pill bg-success"><i class="bi bi-check2" task-id="${todo.id}" done="false"></i></span>
    </div>
  </li>
`;
      } else {
        tasks_html +=
          `<li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
        <s>${todo.title}
  <span class="badge bg-info rounded-pill mark">${todo.category_name}</span>
  </div>
    <div>
    <span class="badge rounded-pill bg-danger"><i class="bi bi-x-lg" task-id="${todo.id}" done="true" ></i></span></s>
    </div>
  </li>
`;
      }
    }
    document.querySelector("#todoList").innerHTML = tasks_html;
  }

}

///////////////////////////////////////////////////////////////

async function getIP(key) {
  if (!key) return document.querySelector("#ip").innerText = "";
  fetch("https://ipinfo.io/json?token=" + key).then(
    (response) => response.json()
  ).then(
    (jsonResponse) => document.querySelector("#ip").innerText = jsonResponse.ip + ("\n") + jsonResponse.country + (", ") + jsonResponse.city + "\n GPS Coordinates: " + jsonResponse.loc);

}


async function getJoke() {

  const Joke_URL = "https://v2.jokeapi.dev";
  const categories = ["Programming", "Misc", "Pun", "Spooky", "Christmas"];
  const params = [
    "blacklistFlags=religious",
    "idRange=0-250"
  ];

  const xhr = new XMLHttpRequest();
  xhr.open("GET", Joke_URL + "/joke/" + categories.join(",") + "?" + params.join("&"));

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status < 300) {
      var randomJoke = JSON.parse(xhr.responseText);

      if (randomJoke.type == "single") {
        document.querySelector("#joke").innerText = randomJoke.joke;

      } else {
        document.querySelector("#joke").innerText = randomJoke.setup;
        document.querySelector("#joke2").innerText = randomJoke.delivery;
      }
    } else if (xhr.readyState == 4) {
      document.querySelector("#joke").innerText = ("Error while requesting joke.\n\nStatus code: " + xhr.status + "\nServer response: " + xhr.responseText);
    }
  };

  xhr.send();
  //Källa: gjort enligt https://sv443.net/jokeapi/v2/#wrappers instruktioner, Gjort med XHR för att få apin till att funka.
}

async function getActivity() {
  const resp = await fetch("https://www.boredapi.com/api/activity/", {
    headers: {
      Accept: "application/json",
    },
  });
  const data = await resp.json();

  document.querySelector("#activity").innerText = data.activity;
}

// TODO hide APIKEY sen när apikey databas skite funkar
async function getCat() {
  const resp = await fetch("https://api.thecatapi.com/v1/images/search", {
    headers: {
      Accept: "application/json",
    },
  });
  const data = await resp.json();
  console.log(data[0].url);

  document.querySelector("#catApi").src = data[0].url;
}
async function completeTask(taskId) {
  if (confirm("Har du säkert utfört To-Do:n " + taskId + " ?")) {
    const resp = await fetch(TODO_URL + "?id=" + taskId, {
      method: 'PUT',
      headers: { 'x-api-key': localStorage.getItem('apiKey') }
    });
    const respData = await resp.json();
    console.log(respData);
    getTodo();
  }
}

async function delTask(taskId) {
  if (confirm("vill du verkligen radera To-Do:n " + taskId + " ?")) {

    const resp = await fetch(TODO_URL + "?id=" + taskId, {
      method: 'DELETE',
      headers: { 'x-api-key': localStorage.getItem('apiKey') }
    });
    const respData = await resp.json();
    console.log(respData);
    getTodo();
  }
}

async function addToDo() {

  if (!document.querySelector('#toDoInput').value) return;
  // https://stackoverflow.com/questions/20855482/preventing-html-and-script-injections-in-javascript
  let title = document.querySelector('#toDoInput').value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let tag = document.querySelector('#toDoTag').value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  toDoData = {
      title: title,
      tag: tag
  }


  const resp = await fetch(TODO_URL + "/?userId=" + userId, {
    method: 'POST',
    headers: {
      'x-api-key': localStorage.getItem("apiKey")
    },
    body: JSON.stringify(toDoData)
  });


  const respData = await resp.json();
  console.log(respData);
  getTodo();
}


// Event listeners & functions that don't require API key
getWidgets();
getJoke();
getActivity();
getCat();
document.getElementById("applyApi").addEventListener("click", applyApi);
// Lyssna på Taskens ikon

document.querySelector('#todoList').addEventListener('click', (event) => {

  if ((event.target.getAttribute("done") == "true")) {
    delTask(event.target.getAttribute("task-id"));
  } else if ((event.target.getAttribute("done") == "false")) {
    completeTask(event.target.getAttribute("task-id"));
  }
});

document.querySelector("#submitToDo").addEventListener('click', addToDo);
document.querySelector("#show").addEventListener('change', getTodo);