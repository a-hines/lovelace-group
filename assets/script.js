// var getPlaylists = function () {

//     var response = fetch("https://api.spotify.com/v1/playlists/3cEYpjA9oz9GiPac4AsH4n");
// console.log(response);
// };

// getPlaylists();
// const musicWeatherMap = {
//     'Additional': ['folk', 'pop', 'hip%20hop', 'shoegaze', 'house', 'metal', 'classic%20rock'],
//     'Atmosphere': ['folk', 'R\&B', 'hip%20hop', 'easy'],
//     'Clear': ['light', 'folk', 'pop', 'dance', 'house', 'psychedelic', 'cheese'],
//     'Clouds': ['techno', 'moody', 'house', 'rock'],
//     'Drizzle': ['folk', 'shoegaze', 'acoustic', 'minimal'],
//     'Extreme': ['gabba', 'extreme%20metal', 'hot', 'burning', 'freezing'],
//     'Rain': ['grunge', 'blac%20metal', 'psych', 'bleak', 'minimal'],
//     'Snow': ['classic%metal', 'christmas', 'black%20metal'],
//     'Thunderstorm': ['dark', 'heavy', 'metal', 'death%20metal', 'hard%techno']
// }

var redirect_uri = "http://127.0.0.1:5500/index.html"

var client_id = "ee9b9fc735074ad49bfd4a2c10247b48";
var client_secret = "9ec3e0120640458da0567d009217b4d9";

var AUTHORIZE = "https://accounts.spotify.com/authorize";
var TOKEN = "https://accounts.spotify.com/api/token";

function onPageLoad(){
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    if (window.location.search.length > 0) {
        // handleRedirect();
        console.log("ohno");
    }
    else {
        handleRedirect();
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
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
    client_id = document.getElementById("clientId").value;
    client_secret = document.getElementById("clientSecret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
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

const moodMusic = {
    rain: ['techno', 'moody', 'house', 'rock'],
    Atmosphere: ['folk', 'R\&B', 'hip%20hop', 'easy'],
    Clear: ['light', 'folk', 'pop', 'dance', 'house', 'psychedelic', 'cheese'],
    Clouds: ['techno', 'moody', 'house', 'rock'],
    Drizzle: ['folk', 'shoegaze', 'acoustic', 'minimal'],
    Extreme: ['gabba', 'extreme%20metal', 'hot', 'burning', 'freezing'],
    Snow: ['classic%metal', 'christmas', 'black%20metal'],
    Thunderstorm: ['dark', 'heavy', 'metal', 'death%20metal', 'hard%techno']

}

const clouds = ['techno', 'moody', 'house', 'rock'];
const additional = ['folk', 'pop', 'hip%20hop', 'shoegaze', 'house', 'metal', 'classic%20rock'];
const atmosphere = ['folk', 'R\&B', 'hip%20hop', 'easy'];
const musicWeatherMap = new Array (clouds, additional, atmosphere);

var APIKey = "c004625bb1231b99945c0d817472e343";

function getWeather(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}`;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(cityWeatherResponse) {
        console.log(cityWeatherResponse.list[0].weather[0].main);
        var weather = cityWeatherResponse.list[0].weather[0].main.toLowerCase()
        // console.log(weather);
        // console.log(musicWeatherMap);
        // console.log(musicWeatherMap[0]);
        for (var i = 0; i < musicWeatherMap.length; i++) {
            console.log(moodMusic.length);
            // if (weather == musicWeatherMap[i]) {
        
            // }
        }
        for (var i = 0; i < musicWeatherMap.length; i++) {
            if (weather == "clouds") {
                var queryCategory = clouds[Math.floor(Math.random()*clouds.length)];
                // getPlaylists(weather);
                var playlistSpotifyURL = `https://api.spotify.com/v1/browse/categories/${queryCategory}/playlists?limit=50`
                $.ajax({
                    url: playlistSpotifyURL,
                    method: "GET",
                }).then(function(response) {

                })
                // console.log(queryCategory);
                
            }
        }
    }) 
};

// function getPlaylists() {
//     var PlaylistSpotifyURL = `https://api.spotify.com/v1/browse/categories/${queryCategory}/playlists?limit=50`;
//     $.ajax({
//         url: PlaylistSpotifyURL,
//         method: "GET",
//     )}.then(function(response) {

//     })
// }

getWeather('indianapolis');
// onPageLoad();