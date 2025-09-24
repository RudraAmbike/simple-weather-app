const api = {
  key: "af148c63774adfdd75c0de1ca8d111d1",
  base: "https://api.openweathermap.org/data/2.5/"
};

const searchbox = document.querySelector('.search-box');
const errorMessage = document.getElementById('error-message');
const cityList = document.getElementById('cityList');
const temperatureDisplay = document.querySelector('.current .temp');
const weatherDisplay = document.querySelector('.current .weather');
const hiLowDisplay = document.querySelector('.hi-low');
const cityNameDisplay = document.querySelector('.location .city');
const dateDisplay = document.querySelector('.location .date');
const dropdownButton = document.getElementById('dropdownButton');
const mapButton = document.querySelector('.map-button');
const mapContainer = document.querySelector('.map');
const forecastContainer = document.getElementById('forecast');

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Kanpur", "Nagpur", "Lucknow", "Visakhapatnam", "Bhopal", "Patna", "Vadodara", "Indore", "Coimbatore", "Agra",
  "Madurai", "Varanasi", "Meerut", "Nashik", "Jodhpur", "Jabalpur", "Guwahati", "Chandigarh", "Thane", "Ludhiana",
  "Tirunelveli", "Allahabad", "Ranchi", "Mysore", "Hubli", "Salem", "Aligarh", "Kochi", "Amritsar", "Gwalior",
  "Bhubaneswar", "Jamshedpur", "Raipur", "Dehradun", "Kozhikode", "Vijayawada", "Bikaner", "Ujjain", "Dhanbad", "Asansol",
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "San Francisco", "Columbus", "Fort Worth", "Indianapolis", "Charlotte", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Louisville", "Baltimore", "Milwaukee",
  "Albuquerque", "Tucson", "Fresno", "Sacramento", "Long Beach", "Kansas City", "Mesa", "Virginia Beach", "Atlanta", "Colorado Springs",
  "Omaha", "Raleigh", "Miami", "Cleveland", "Tulsa", "Oakland", "Minneapolis", "Wichita", "New Orleans", "Arlington"
];

cities.forEach(city => {
  const cityDiv = document.createElement('div');
  cityDiv.className = 'city';
  cityDiv.textContent = city;
  cityDiv.onclick = () => fetchTemperature(city);
  cityList.appendChild(cityDiv);
});

dropdownButton.addEventListener('click', () => {
  cityList.style.display = cityList.style.display === "block" ? "none" : "block";
});

searchbox.addEventListener('keypress', function(evt) {
  if (evt.key === 'Enter') {
    fetchTemperature(searchbox.value);
  }
});

function fetchTemperature(city) {
  fetch(`${api.base}forecast?q=${city}&units=metric&APPID=${api.key}`)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(displayResults)
    .catch(handleError);
}

function fetchTemperatureByCoords(lat, lon) {
  fetch(`${api.base}forecast?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`)
    .then(response => {
      if (!response.ok) throw new Error('Location not found');
      return response.json();
    })
    .then(displayResults)
    .catch(handleError);
}

function displayResults(weather) {
  if (!weather || !weather.city || !weather.city.name || !weather.city.country) {
    errorMessage.textContent = "Invalid city data.";
    return;
  }

  const now = new Date();
  cityNameDisplay.innerText = `${weather.city.name}, ${weather.city.country}`;
  dateDisplay.innerText = dateBuilder(now);

  const tempC = Math.round(weather.list[0].main.temp);
  temperatureDisplay.innerHTML = `${tempC}<span>°C</span>`;
  weatherDisplay.innerText = weather.list[0].weather[0].main;

  const minTemp = Math.round(weather.list[0].main.temp_min - 2);
  const maxTemp = Math.round(weather.list[0].main.temp_max + 2);
  hiLowDisplay.innerText = `${minTemp}°C / ${maxTemp}°C`;

  let forecastHTML = '';
  for (let i = 0; i < 5; i++) {
    const dayData = weather.list[i * 8];
    if (!dayData) continue;

    const day = new Date(dayData.dt * 1000);
    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTempMin = Math.round(dayData.main.temp_min);
    const dayTempMax = Math.round(dayData.main.temp_max);
    const weatherIcon = dayData.weather[0].icon;

    forecastHTML += `
      <div class="day">
        <div class="day-name">${dayName}</div>
        <div class="temp">${dayTempMin}°/${dayTempMax}°</div>
        <div class="icon">
          <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${dayData.weather[0].description}" />
        </div>
      </div>
    `;
  }
  forecastContainer.innerHTML = forecastHTML;
  errorMessage.textContent = '';
}

function handleError(error) {
  errorMessage.textContent = error.message;
  temperatureDisplay.innerHTML = '--<span>°C</span>';
  weatherDisplay.innerText = '--';
  hiLowDisplay.innerText = '--';
  cityNameDisplay.innerText = 'Select a city';
  dateDisplay.innerText = '';
  forecastContainer.innerHTML = '';
}

function dateBuilder(d) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}


let map; 

mapButton.addEventListener('click', () => {
  const isVisible = mapContainer.style.display === 'block';
  mapContainer.style.display = isVisible ? 'none' : 'block';

  if (!isVisible) {
    if (!map) {
      setTimeout(() => {
        map = L.map('map').setView([51.505, -0.09], 5); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        map.on('click', function(e) {
          const { lat, lng } = e.latlng;
          fetchTemperatureByCoords(lat, lng);
        });
      }, 100); 
    } else {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }
});
