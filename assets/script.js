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

var redirect_uri = "C:/Users/matti/Documents/Bootcamp/Projects/lovelace-group/index.html"
var spotifyApi = new SpotifyWebApi({
    clientId: 'ee9b9fc735074ad49bfd4a2c10247b48',
    clientSecret: '9ec3e0120640458da0567d009217b4d9'
});

spotifyApi.clientCredentialsGrant().
    then(function(result) {
        console.log('It worked! Your access token is: ' + result.body.access_token); 
    }).catch(function(err) {
        console.log('If this is printed, it probably means that you used invalid ' +
        'clientId and clientSecret values. Please check!');
        // console.log('Hint: ');
        // console.log(err);
});
    
spotifyApi.clientCredentialsGrant().then(
    function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
  
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log(
        'Something went wrong when retrieving an access token',
        err.message
      );
    }
);
    
var authorize = "https://accounts.spotify.com/authorize";
var token = "https://accounts.spotify.com/api/token";

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
        // console.log(cityWeatherResponse.list[0].weather[0].main);
        var weather = cityWeatherResponse.list[0].weather[0].main.toLowerCase()
        // console.log(weather);
        // console.log(musicWeatherMap);
        // for (var i = 0; i < musicWeatherMap.length; i++) {
        //     if (weather == musicWeatherMap[i]) {
        // 
        //     }
        // }
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