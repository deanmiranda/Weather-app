const apiKey = '8c2815b4840aae521bf9478cec747275'; 
const searchForm = document.querySelector('[data-search-form]');
const cityInput = document.querySelector('[data-city-input]');
const currentWeatherSection = document.querySelector('[data-current-weather]');
const forecastSection = document.querySelector('[data-forecast]');
const searchHistorySection = document.querySelector('[data-search-history]');
let weatherData = {};
const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

function saveSearchHistoryToLocalStorage() {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

function loadSearchHistoryFromLocalStorage() {
  searchHistory.forEach(city => {
    const historyItem = document.createElement('button');
    historyItem.classList.add('historyButton');
    historyItem.textContent = city;
    searchHistorySection.appendChild(historyItem);
  });
}

function updateCurrentWeather(data) {
  currentWeatherSection.innerHTML = `
    <h2>${data.name} (${new Date().toLocaleDateString()})</h2>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

function updateForecast(data) {
  forecastSection.innerHTML = '<h2>5-Day Forecast:</h2>';

  for (let i = 0; i < data.list.length; i += 8) {
    const forecast = data.list[i];
    const date = new Date(forecast.dt * 1000);
    const icon = forecast.weather[0].icon;

    forecastSection.innerHTML += `
      <div class="forecastDay">
        <p class="forecastResultsDate">Date: ${date.toLocaleDateString()}</p>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"  class="forecastResultsIcon">
        <p class="forecastResultsTemp">Temperature: ${forecast.main.temp} °C</p>
        <p class="forecastResultsWind">Wind Speed: ${forecast.wind.speed} m/s</p>
        <p class="forecastResultsHumidity">Humidity: ${forecast.main.humidity}%</p>
      </div>
    `;
  }
}


function updateSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    searchHistorySection.innerHTML = '';

    for (const city of searchHistory) {
      const historyItem = document.createElement('button');
      historyItem.textContent = city;
      historyItem.classList.add('historyButton');
      searchHistorySection.appendChild(historyItem);
    }
  }
}

async function fetchWeatherData(city) {
  try {
    const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    const currentWeatherData = await currentWeatherResponse.json();

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    weatherData[city] = { current: currentWeatherData, forecast: forecastData };
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

searchForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();

  if (!weatherData[city]) {
    await fetchWeatherData(city);
  }

  if (weatherData[city]) {
    updateCurrentWeather(weatherData[city].current);
    updateForecast(weatherData[city].forecast);

    updateSearchHistory(city);
    saveSearchHistoryToLocalStorage();
  }

  cityInput.value = '';
});

searchHistorySection.addEventListener('click', async function (e) {
  if (e.target.tagName === 'BUTTON') {
    const city = e.target.textContent;
    cityInput.value = city;
    searchForm.dispatchEvent(new Event('submit'));
  }
});

loadSearchHistoryFromLocalStorage();
