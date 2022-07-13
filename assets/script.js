

var baseURL = "https://api.openweathermap.org";
var APIKey = "c004625bb1231b99945c0d817472e343";

var redirect_uri = "http://127.0.0.1:5500/index.html"

var client_id = "ee9b9fc735074ad49bfd4a2c10247b48";
var client_secret = "9ec3e0120640458da0567d009217b4d9";

var AUTHORIZE = "https://accounts.spotify.com/authorize";
var TOKEN = "https://accounts.spotify.com/api/token";

var access_token = null;
var refresh_token = null;


function onPageLoad(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);
    // can probaly change to variables instead of always pulliing from local storage 

    if (window.location.search.length > 0) {
        handleRedirect();
        // console.log("ohno");
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization(){
    // client_id = document.getElementById("clientId").value;
    // client_secret = document.getElementById("clientSecret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    // I can change the scope for what we need 
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    console.log(body);
    xhr.send(body);
    xhr.onload = callback;
}

function getPlaylist(category_id) {
    const playlistSpotifyURL ="https://api.spotify.com/v1/browse/categories/" + category_id +"/playlists?limit=50";
    function refreshPlaylist() {
        callApi( "GET", playlistSpotifyURL, null, handlePlaylistsResponse );
    }

    function handlePlaylistsResponse(){
        if ( this.status == 200 ){
            var data = JSON.parse(this.responseText);
            showPlaylist(data);
        }
        else if ( this.status == 401 ){
            refreshAccessToken()
        }
        else {
            console.log(this.responseText);
            alert(this.responseText);
        }
    }
    refreshPlaylist();
}

function showPlaylist(data) {
  for (let i = 0; i < 3; i++) {
    // var randomNumber = Math.floor(Math.random()* 50);
    // console.log(randomNumber);
    // console.log(data);
    var specificPlaylist = data.playlists.items[Math.floor(Math.random()* 50)].external_urls.spotify
    var newnew = JSON.stringify(specificPlaylist)
    // var playlistImage = document.createElement("img");
    // playlistImage.src =data.playlists.items[Math.floor(Math.random()* 50)].images[0].url
    // var src = document.getElementById('playlistImg' + [i]);
    // console.log(src);
    // console.log(newnew);
    document.getElementById('playlist' + [i]).innerHTML = (newnew);
    // document.getElementById('playlistImg' + [i]).appendChild = (src);

  }
}

// const moodMusic = {
//     rain: ['techno', 'moody', 'house', 'rock'],
//     Atmosphere: ['folk', 'R\&B', 'hip%20hop', 'easy'],
//     Clear: ['light', 'folk', 'pop', 'dance', 'house', 'psychedelic', 'cheese'],
//     Clouds: ['techno', 'moody', 'house', 'rock'],
//     Drizzle: ['folk', 'shoegaze', 'acoustic', 'minimal'],
//     Extreme: ['gabba', 'extreme%20metal', 'hot', 'burning', 'freezing'],
//     Snow: ['classic%metal', 'christmas', 'black%20metal'],
//     Thunderstorm: ['dark', 'heavy', 'metal', 'death%20metal', 'hard%techno']

// }

// const clouds = ['techno', 'moody', 'house', 'rock'];
// const additional = ['folk', 'pop', 'hip%20hop', 'shoegaze', 'house', 'metal', 'classic%20rock'];
// const atmosphere = ['folk', 'R\&B', 'hip%20hop', 'easy'];
const musicWeatherMap = ['clouds', 'additional', 'atmosphere'];


function getWeather(city) {
  console.log(city);
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}`;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(cityWeatherResponse) {
      for (i = 0; i < 5; i++) {
        var date = new Date(
            cityWeatherResponse.list[(i + 1) * 8 - 1].dt * 1000
        ).toLocaleDateString();
        var temp = cityWeatherResponse.list[(i + 1) * 8 - 5].main.temp_max; 
        var humidity = cityWeatherResponse.list[(i + 1) * 8 - 1].main.humidity;
        var iconcode = cityWeatherResponse.list[(i + 1) * 8 - 1].weather[0].icon;
        var iconurl = `http://openweathermap.org/img/wn/${iconcode}.png`;
        var windSpeed = cityWeatherResponse.list[(i + 1) * 8 - 1].wind.speed;
        }
        $(cityName).html(cityWeatherResponse.city.name + " (" + date + ")" + "<img src=" + iconurl + ">");
        var temp = cityWeatherResponse.list[0].main.temp;
        $("#temperature").html("Temperature: " + temp.toFixed(2) + "&#8457");
        $("#humidity").html("Humidity: " + cityWeatherResponse.list[0].main.humidity + "%");
        var windSpeed = cityWeatherResponse.list[0].wind.speed;
        var windSpeedMPH = (windSpeed * 2.237).toFixed(1);
        $("#windSpeed").html("Wind Speed: " + windSpeedMPH + "MPH");

        
        // console.log(cityWeatherResponse.list[0].weather[0].main);
        var weather = cityWeatherResponse.list[0].weather[0].main.toLowerCase()
        for (var i = 0; i < musicWeatherMap.length; i++) {
            if (weather == musicWeatherMap[i]) {
              console.log(weather);
                const clouds = ['hiphop', 'jazz', 'summer', 'rock'];
                const additional = ['folk', 'pop', 'hip%20hop', 'shoegaze', 'house', 'metal', 'classic%20rock'];
                const atmosphere = ['folk', 'R\&B', 'hip%20hop', 'easy'];
                // arrays go here
                var arrayCategory = musicWeatherMap[i];
                  if (arrayCategory == "clouds") {
                    var category_id = clouds[Math.floor(Math.random()*clouds.length)];
                    getPlaylist(category_id);
                  } else if (arrayCategory == "additional") {
                    var category_id = additional[Math.floor(Math.random()*additional.length)];
                    getPlaylist(category_id);
                  } else if (arrayCategory == "atmosphere") {
                    var category_id = atmosphere[Math.floor(Math.random()*atmosphere.length)];
                    getPlaylist(category_id);
                  }           
            }
        }
    }) 
};

function startWeather(event) {
  event.preventDefault();
  var city = $("#enterCity").val().trim();
  getWeather(city);
};

$("#searchButton").on("click", startWeather);


onPageLoad();