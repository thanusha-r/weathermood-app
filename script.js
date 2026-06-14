const API_KEY = 'YOUR_API_KEY_HERE'; // ← paste your API key here

// ===== TIME & DATE =====
function updateTime(){
  var now = new Date();
  var time = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  var date = now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('currentTime').textContent = time;
  document.getElementById('currentDate').textContent = date;
}
setInterval(updateTime, 1000);
updateTime();

// ===== TIPS TICKER =====
var tipIndex = 0;
var tips = document.querySelectorAll('.tip');
function rotateTips(){
  tips[tipIndex].classList.remove('active');
  tipIndex = (tipIndex + 1) % tips.length;
  tips[tipIndex].classList.add('active');
}
setInterval(rotateTips, 4000);

// ===== ENTER KEY =====
document.getElementById('cityInput').addEventListener('keypress', function(e){
  if(e.key === 'Enter') getWeather();
});

// ===== QUICK CITY SEARCH =====
function searchCity(city){
  document.getElementById('cityInput').value = city;
  getWeather();
}

// ===== GET LOCATION =====
function getLocation(){
  if(!navigator.geolocation){ showError('Geolocation not supported!'); return; }
  showLoading();
  navigator.geolocation.getCurrentPosition(function(pos){
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  }, function(){
    hideLoading();
    showError('Location access denied!');
  });
}

// ===== GET WEATHER BY CITY =====
function getWeather(){
  var city = document.getElementById('cityInput').value.trim();
  if(!city){ showError('Please enter a city name!'); return; }
  showLoading();
  fetch('https://api.openweathermap.org/data/2.5/weather?q='+city+'&appid='+API_KEY+'&units=metric')
    .then(function(res){ return res.json(); })
    .then(function(data){
      hideLoading();
      if(data.cod !== 200){ showError('City not found! Try again.'); return; }
      displayWeather(data);
    })
    .catch(function(){
      hideLoading();
      showError('Something went wrong! Check your internet.');
    });
}

// ===== GET WEATHER BY COORDS =====
function fetchWeatherByCoords(lat, lon){
  fetch('https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lon+'&appid='+API_KEY+'&units=metric')
    .then(function(res){ return res.json(); })
    .then(function(data){
      hideLoading();
      if(data.cod !== 200){ showError('Could not get weather!'); return; }
      displayWeather(data);
    })
    .catch(function(){
      hideLoading();
      showError('Something went wrong!');
    });
}

// ===== DISPLAY WEATHER =====
function displayWeather(data){
  var temp = Math.round(data.main.temp);
  var feelsLike = Math.round(data.main.feels_like);
  var humidity = data.main.humidity;
  var windSpeed = Math.round(data.wind.speed * 3.6);
  var visibility = data.visibility ? (data.visibility/1000).toFixed(1) : 'N/A';
  var pressure = data.main.pressure;
  var condition = data.weather[0].main;
  var description = data.weather[0].description;
  var city = data.name;
  var country = data.sys.country;
  var sunrise = new Date(data.sys.sunrise*1000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  var sunset = new Date(data.sys.sunset*1000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  var isNight = Date.now()/1000 > data.sys.sunset || Date.now()/1000 < data.sys.sunrise;

  // Country name map
  var countryNames = {IN:'India',US:'USA',GB:'UK',JP:'Japan',AE:'UAE',FR:'France',AU:'Australia',CA:'Canada',DE:'Germany',SG:'Singapore'};
  var countryFull = countryNames[country] || country;

  document.getElementById('cityName').textContent = city;
  document.getElementById('countryName').textContent = countryFull;
  document.getElementById('tempMain').textContent = temp + '°C';
  document.getElementById('feelsLike').textContent = 'Feels like ' + feelsLike + '°C';
  document.getElementById('condition').textContent = description;
  document.getElementById('humidity').textContent = humidity + '%';
  document.getElementById('windSpeed').textContent = windSpeed + ' km/h';
  document.getElementById('visibility').textContent = visibility + ' km';
  document.getElementById('pressure').textContent = pressure + ' hPa';
  document.getElementById('sunrise').textContent = sunrise;
  document.getElementById('sunset').textContent = sunset;

  var icon, theme, mood, suggestion, outfit;

  if(isNight){
    icon='🌙'; theme='theme-night';
    mood='🌙 Good Night!';
    suggestion='It\'s night time! Rest well and stay warm.';
    outfit="🌙 Night weather is pleasant. A light jacket is recommended if you're staying outdoors for long periods.";
  } else if(condition==='Thunderstorm'){
    icon='⛈️'; theme='theme-stormy';
    mood='⛈️ Storm Alert!';
    suggestion='Dangerous weather! Stay indoors and stay safe.';
    outfit='Don\'t go out! If must, wear waterproof gear.';
  } else if(condition==='Drizzle'||condition==='Rain'){
    icon='🌧️'; theme='theme-rainy';
    mood='🌧️ Rainy Vibes!';
    suggestion='Perfect day to stay in with a hot drink ☕';
    outfit='Carry an umbrella and wear waterproof shoes.';
  } else if(condition==='Snow'){
    icon='❄️'; theme='theme-snowy';
    mood='❄️ Winter Wonderland!';
    suggestion='Snow day! Bundle up and enjoy the white magic.';
    outfit='Wear heavy coat, gloves, scarf and warm boots.';
  } else if(condition==='Clear'){
    icon='☀️'; theme='theme-sunny';
    mood='☀️ Perfect Day!';
    suggestion='Beautiful sunny day! Great time to go outside.';
    outfit='Light cotton clothes and sunglasses recommended.';
  } else if(condition==='Clouds'){
    icon='☁️'; theme='theme-cloudy';
    mood='☁️ Cloudy Day!';
    suggestion='Cloudy but comfortable. Good day for a walk!';
    outfit='Light jacket recommended — might get breezy.';
  } else {
    icon='🌤️'; theme='theme-cloudy';
    mood='🌤️ Mixed Weather!';
    suggestion='Moderate weather. Have a great day!';
    outfit='Comfortable casual wear should be fine.';
  }

  if(temp >= 38){
    suggestion = '🥵 Very hot outside! Stay hydrated and avoid midday sun.';
    outfit = 'Light breathable clothes. Carry water bottle!';
  } else if(temp <= 10){
    suggestion = '🥶 Very cold! Layer up before going out.';
    outfit = 'Heavy warm layers, scarf and gloves essential.';
  }

  document.getElementById('weatherIcon').textContent = icon;
  document.getElementById('moodBadge').textContent = mood;
  document.getElementById('suggestion').textContent = suggestion;
  document.getElementById('outfitText').textContent = outfit;

  document.getElementById('app').className = 'app ' + theme;
  document.getElementById('defaultState').classList.add('gone');
  document.getElementById('errorBox').classList.add('gone');
  document.getElementById('weatherCard').classList.remove('gone');
}

// ===== HELPERS =====
function showLoading(){
  document.getElementById('loadingBox').classList.remove('gone');
  document.getElementById('weatherCard').classList.add('gone');
  document.getElementById('errorBox').classList.add('gone');
  document.getElementById('defaultState').classList.add('gone');
}
function hideLoading(){
  document.getElementById('loadingBox').classList.add('gone');
}
function showError(msg){
  document.getElementById('errorBox').textContent = '⚠️ ' + msg;
  document.getElementById('errorBox').classList.remove('gone');
  document.getElementById('weatherCard').classList.add('gone');
  document.getElementById('defaultState').classList.remove('gone');
  setTimeout(function(){ document.getElementById('errorBox').classList.add('gone'); }, 3000);
}