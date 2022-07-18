// Base URL and API key for openweather 

var baseURL = "https://api.openweathermap.org";
var APIKey = "c004625bb1231b99945c0d817472e343";

//Redirect URL for spotify app

var redirect_uri = "https://a-hines.github.io/lovelace-group/index.html"

//Credentials for Spotify

var client_id = "ee9b9fc735074ad49bfd4a2c10247b48";
var client_secret = "9ec3e0120640458da0567d009217b4d9";

//Base URL for spotify calls

var AUTHORIZE = "https://accounts.spotify.com/authorize";
var TOKEN = "https://accounts.spotify.com/api/token";

var access_token = null;
var refresh_token = null;

//When Page is loaded, credentials are stored.

function onPageLoad(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    if (window.location.search.length > 0) {
        handleRedirect();
    }
}

//Gets access token while handling redirect uri

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

//Gets access code from the url that is returned

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

//Asks for authorization from the user to access the scopes listed

function requestAuthorization(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); 
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url;
}

//following the handleRedirect()

function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

//following the handleRedirect()

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

// Handles errors and if refresh tokens are expired, deals with that issue which is most common

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

//calls api

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

//gets playlist based on the category id given at random

function getPlaylist(category_id) {
    const playlistSpotifyURL ="https://api.spotify.com/v1/browse/categories/" + category_id +"/playlists?limit=50";
    function refreshPlaylist() {
        callApi( "GET", playlistSpotifyURL, null, handlePlaylistsResponse);
    }

    function handlePlaylistsResponse() {
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

//Shows three playlists using for statement

function showPlaylist(data) {
  for (let i = 0; i < 3; i++) {
    
    var playlistDiv = document.getElementById('playlist' + [i]);
    playlistDiv.innerHTML = "";
    var randomNumber = Math.floor(Math.random()* 25);
    var currentPlaylist = data.playlists.items[randomNumber];
    var playlistName = currentPlaylist.name;
    var playlistURL = currentPlaylist.external_urls.spotify;
    var playlistAPI = currentPlaylist.href;

    function getSongs(playlistAPI) {
        function refreshPlaylist() {
        callApi("GET", playlistAPI, null, handlePlaylistsResponse);
        }
        function handlePlaylistsResponse(){
            if ( this.status == 200 ){
                var data = JSON.parse(this.responseText);
                var tracksDiv = document.getElementById('track-list' + [i]);
                console.log(data);
                var tracklistDiv = document.createElement("div");
                var songsForm = document.createElement("select");
                var songButton = document.createElement("button");
                var singleSong = document.createElement("div");
                songsForm.setAttribute("id", "tracks" + [i]);
                songsForm.setAttribute("class", "form-control mt-2");
                songButton.setAttribute("id", "searchSong" + [i]);
                songButton.setAttribute("class", "btn btn-primary mt-2 mb-2");
                songButton.setAttribute("type", "button");
                songButton.setAttribute("onclick", "getSongPreview()");
                songButton.innerHTML = "Checkout Song!";
                singleSong.setAttribute("id", "singleTrack" + [i]);
                tracksDiv.appendChild(tracklistDiv);
                tracklistDiv.appendChild(songsForm);
                tracklistDiv.appendChild(songButton);
                tracklistDiv.appendChild(singleSong);
                
                for (let j = 0; j < data.tracks.items.length; j++) {
                    var node = document.createElement("option");                
                    node.value = data.tracks.items[j].track.id;
                    node.innerHTML = data.tracks.items[j].track.name + " (" + data.tracks.items[j].track.artists[0].name + ")";
                    songsForm.appendChild(node);
                }
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
    };

    getSongs(playlistAPI);

    var playlistImage = document.createElement("img");
    var heading = document.createElement("h4");
    var playlistExternalURL = document.createElement("a")
    var songsDiv = document.createElement("div");

    playlistExternalURL.setAttribute("href", playlistURL);
    playlistExternalURL.setAttribute("class", "card-url");
    playlistExternalURL.innerHTML = "__Click to go to playlist!__";
    songsDiv.setAttribute("id", "track-list" + [i]);
    playlistImage.src = currentPlaylist.images[0].url;
    playlistImage.setAttribute("class", "mb-4")
    heading.setAttribute("class", "mt-4");
    heading.innerHTML = playlistName;
    

    playlistDiv.appendChild(heading);
    playlistDiv.appendChild(playlistImage);
    playlistDiv.appendChild(playlistExternalURL);
    playlistDiv.appendChild(songsDiv);

  }
}

// If song is chosen from the options list, then we get the album cover and a link to preview song

function getSongPreview() {
    if (this.event.target.id == "searchSong0") {
        var songID = document.getElementById("tracks0").value
        const trackAPI = "https://api.spotify.com/v1/tracks/" + songID;
        function getSingleSong () {
            callApi("GET", trackAPI, null, handleSongResponse);
        }
        function handleSongResponse() {
            if ( this.status == 200 ) {
                var data = JSON.parse(this.responseText);
                var singleSongDiv = document.getElementById("singleTrack0");
                singleSongDiv.innerHTML = "";
                var singleSongList = document.createElement("div");
                var songAlbumImage = document.createElement("img");
                var songPreview = document.createElement("a");
                var songUrl = data.preview_url;

                songAlbumImage.src = data.album.images[0].url;
                songAlbumImage.setAttribute("class", "mb-3")
                songPreview.setAttribute("href", songUrl);
                songPreview.setAttribute("class", "card-url");
                songPreview.setAttribute("onClick", "newTab()");
                songPreview.innerHTML = "Preview " + data.name;

                singleSongDiv.appendChild(singleSongList);
                singleSongList.appendChild(songAlbumImage);
                singleSongList.appendChild(songPreview);
            }
            else if ( this.status == 401 ) {
                refreshAccessToken()
            }
            else {
                console.log(this.responseText);
                alert(this.responseText);
            }
        }
        getSingleSong();

    } else if (this.event.target.id == "searchSong1") {
        var songID = document.getElementById("tracks1").value
        const trackAPI = "https://api.spotify.com/v1/tracks/" + songID;
        function getSingleSong () {
            callApi("GET", trackAPI, null, handleSongResponse);
        }
        function handleSongResponse() {
            if ( this.status == 200 ) {
                var data = JSON.parse(this.responseText);
                var singleSongDiv = document.getElementById("singleTrack1");
                singleSongDiv.innerHTML = "";
                var singleSongList = document.createElement("div");
                var songAlbumImage = document.createElement("img");
                var songPreview = document.createElement("a");
                var songUrl = data.preview_url;

                songAlbumImage.src = data.album.images[0].url;
                songAlbumImage.setAttribute("class", "mb-3")
                songPreview.setAttribute("href", songUrl);
                songPreview.setAttribute("class", "card-url");
                songPreview.setAttribute("onClick", "newTab()");
                songPreview.innerHTML = "Preview " + data.name;

                singleSongDiv.appendChild(singleSongList);
                singleSongList.appendChild(songAlbumImage);
                singleSongList.appendChild(songPreview);
            }
            else if ( this.status == 401 ) {
                refreshAccessToken()
            }
            else {
                console.log(this.responseText);
                alert(this.responseText);
            }
        }
        getSingleSong();

    } else {
        var songID = document.getElementById("tracks2").value
        const trackAPI = "https://api.spotify.com/v1/tracks/" + songID;
        function getSingleSong () {
            callApi("GET", trackAPI, null, handleSongResponse);
        }
        function handleSongResponse() {
            if ( this.status == 200 ) {
                var data = JSON.parse(this.responseText);
                var singleSongDiv = document.getElementById("singleTrack2");
                singleSongDiv.innerHTML = "";
                var singleSongList = document.createElement("div");
                var songAlbumImage = document.createElement("img");
                var songPreview = document.createElement("a");
                var songUrl = data.preview_url;

                songAlbumImage.src = data.album.images[0].url;
                songAlbumImage.setAttribute("class", "mb-3")
                songPreview.setAttribute("href", songUrl);
                songPreview.setAttribute("class", "card-url");
                songPreview.setAttribute("onClick", "newTab()");
                songPreview.innerHTML = "Preview " + data.name;

                singleSongDiv.appendChild(singleSongList);
                singleSongList.appendChild(songAlbumImage);
                singleSongList.appendChild(songPreview);
            }
            else if ( this.status == 401 ) {
                refreshAccessToken()
            }
            else {
                console.log(this.responseText);
                alert(this.responseText);
            }
        }
        getSingleSong();
    }
}
//Some reason this doesn't work but I don't get it, I will try to ask in office hours but if I didnt sorry.
//Wanted this to work so when the Playlist Url or the Sample Url was clicked, it would open a new tab vs opening in the current tab
function newTab() {
    window.open(url, '_blank');
}
// Weather condition variables into an array
const musicWeatherMap = ['clouds', 'additional', 'atmosphere', 'rain', 'clear', 'drizzle', 'extreme', 'snow', 'thunderstorm'];

//Weather API call for today's forecast
function getWeather(city) {
  console.log(city);
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(cityWeatherResponse) {
        var today = new Date();
        var date = (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear();
        var humidity = cityWeatherResponse.list[0].main.humidity;
        var wind = cityWeatherResponse.list[0].wind.speed;
        var temp = cityWeatherResponse.list[0].main.temp;
        var iconcode = cityWeatherResponse.list[0].weather[0].icon;
        var iconurl = `http://openweathermap.org/img/wn/${iconcode}.png`;
        $("#cityName").html(cityWeatherResponse.city.name + " (" + date + ") " + "<img src=" + iconurl + ">");
        $("#temperature").html("Temperature: " + temp + " &#8457");
        $("#humidity").html("Humidity: " + humidity + "%");
        $("#windSpeed").html("Wind Speed: " + wind + "MPH");
        var weather = cityWeatherResponse.list[0].weather[0].main.toLowerCase();
        //Changed the weather condition to lowercase to match variables. Probably didn't have to but I like variables starting with lowercase :)
        for (var i = 0; i < musicWeatherMap.length; i++) {
            if (weather == musicWeatherMap[i]) {
                // Arrays are now created for the variables in the array
                const clouds = ['0JQ5DAqbMKFPrEiAOxgac3', 'jazz', '0JQ5DAqbMKFIpEuaCnimBj', 'rock'];
                const additional = ['alternative', 'roots', '0JQ5DAqbMKFAUsdyVjCQuL', 'pop', 'pride', 'metal', 'country'];
                const atmosphere = ['party', 'summer', 'hip%20hop', '0JQ5DAqbMKFImHYGo3eTSg', 'country'];
                const rain = ['0JQ5DAqbMKFIpEuaCnimBj', '0JQ5DAqbMKFCfObibaOZbv', 'jazz', '0JQ5DAqbMKFCbimwdOYlsl', '0JQ5DAqbMKFGvOw3O4nLAf'];
                const clear = ['summer', 'party', 'pop', 'edm_dance', 'toplists', 'hiphop', '0JQ5DAqbMKFQIL0AXnG5AK'];
                const drizzle = ['at_home', 'jazz', 'chill', '0JQ5DAqbMKFAUsdyVjCQuL', 'mood'];
                const extreme = ['0JQ5DAqbMKFPrEiAOxgac3', 'alternative', 'roots', 'hiphop', 'rock', 'edm_dance'];
                const snow = ['0JQ5DAqbMKFIpEuaCnimBj', 'jazz', '0JQ5DAqbMKFJw7QLnM27p6', 'toplists', 'hiphop'];
                const thunderstorm = ['alternative', '0JQ5DAqbMKFIpEuaCnimBj', 'at_home', 'chill', '0JQ5DAqbMKFCfObibaOZbv'];
                var arrayCategory = musicWeatherMap[i];
                // Then if the variable mactches, then we use math.random to get a random category based on the weather condition
                  if (arrayCategory == "clouds") {
                    var category_id = clouds[Math.floor(Math.random()*clouds.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for cloudy weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "additional") {
                    var category_id = additional[Math.floor(Math.random()*additional.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for chaotic weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "atmosphere") {
                    var category_id = atmosphere[Math.floor(Math.random()*atmosphere.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for atmospheric weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "rain") {
                    var category_id = rain[Math.floor(Math.random()*rain.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for rainy weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "clear") {
                    var category_id = clear[Math.floor(Math.random()*clear.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for clear weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "drizzle") {
                    var category_id = drizzle[Math.floor(Math.random()*drizzle.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for drizzly weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "extreme") {
                    var category_id = extreme[Math.floor(Math.random()*extreme.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for extreme weather!"
                    getPlaylist(category_id);
                  } else if (arrayCategory == "snow") {
                    var category_id = snow[Math.floor(Math.random()*snow.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for snowy weather!"
                    getPlaylist(category_id);
                  } else {
                    var category_id = thunderstorm[Math.floor(Math.random()*thunderstorm.length)];
                    var listText = document.getElementById("playlist-header");
                    listText.innerHTML = "";
                    listText.innerHTML = "List of playlists for thundery weather!"
                    getPlaylist(category_id);
                  } 
            }
        }
    }) 
};

//Starts weather search and shortens word
function startWeather(event) {
  event.preventDefault();
  var city = $("#enterCity").val().trim();
  getWeather(city);
};

// On click events
$("#searchButton").on("click", startWeather);

// On page load for spotify API call
onPageLoad();