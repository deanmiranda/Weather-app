
const weatherButton = document.querySelector(".checkWeatherButton");
weatherButton.addEventListener('click', callWeather);
const weather = document.querySelector('.weatherResults');
let fahrenheit;

// Use weather API
function callWeather(e) {
    e.preventDefault();
    const APP_API = '';
    let cityInput = document.querySelector(".cityInput").value;
    // check if city is in local storage, dont call api again if it is.
    if (cityInput === localStorage.getItem('city')) {
        location.reload();
        alert('You already checked this city');
    }
    let apiLink = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&cnt=30&appid=${APP_API}`;

    fetch(apiLink).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        drawWeather(data);
        createHistoryButton();
        hideError();
    }).catch(function(err) {
        showError();
        console.log('City not found, please try again.', err);
    });
}

// Function to change kelvin to fahrenheit
function convertTemp(d) {
	fahrenheit = Math.round(((parseFloat(d.list[0].main.temp)-273.15)*1.8)+32); 
}

// Get data for future and current Weather for the city

function drawWeather(d) {
    weather.classList.remove('d-none');
    convertTemp(d);

    // Html changes

    // Changing time from date.time now to time in city using offset, needs fix for offset, showing three hours early
    date = new Date()
    localTime = date.getTime()
    localOffset = date.getTimezoneOffset() * 60000
    utc = localTime + localOffset
    var newTime = utc + (1000 * d.city.timezone)
    // remove time from date
    var newDate = new Date(newTime).toISOString().split('T')[0];
    // swap - for / 
    let datearray = newDate.split("-");
    // move the date pieces into correct order
    let fixedDate = datearray[1] + '/' + datearray[2] + '/' + datearray[0];
    // Changing the icon to the weather icon from data

    // Add the below data points to my local storage.

	document.querySelector('.weatherResultsCity').innerHTML = d.city.name;
    document.querySelector('.weatherResultsDate').innerHTML = fixedDate;
	document.querySelector('.weatherResultsIcon').src = `http://openweathermap.org/img/w/${d.list[0].weather[0].icon}.png`;
    document.querySelector('.weatherResultsTemp').innerHTML = fahrenheit + '&deg;';
    document.querySelector('.weatherResultsHumidity').innerHTML = d.list[0].main.humidity + '%';
    document.querySelector('.weatherResultsWind').innerHTML = d.list[0].wind.speed + ' mph';
    storeCity(d.city.name)
     // Store the forecast data in localStorage
    storeForecast({
        date: fixedDate,
        icon: d.list[0].weather[0].icon,
        temp: fahrenheit,
        humidity: d.list[0].main.humidity,
        wind: d.list[0].wind.speed
    });

    // create a for each loop and distribute the data across an array for the 5 day forecast
    buildForecastList(d);
}

function storeCity(cityName) {
    let cities = getCitiesFromStorage();
    cities.push(cityName);
    localStorage.setItem("Cities", JSON.stringify(cities));
}

function storeForecast(forecastData) {
    let forecasts = getForecastsFromStorage();
    forecasts.push(forecastData);
    localStorage.setItem("Forecasts", JSON.stringify(forecasts));
}

function getCitiesFromStorage() {
    let cities = localStorage.getItem("Cities");
    return cities ? JSON.parse(cities) : [];
}

function getForecastsFromStorage() {
    let forecasts = localStorage.getItem("Forecasts");
    return forecasts ? JSON.parse(forecasts) : [];
}

// Create Forecast for 5 days
function buildForecastList(data) {
    // Forecast HTML
    let forecastDate = document.querySelectorAll('.forecastResultsDate');
    let forecastIcon = document.querySelectorAll('.forecastResultsIconImage');
    let forecastTemp = document.querySelectorAll('.forecastResultsTemp');
    let forecastHumidity = document.querySelectorAll('.forecastResultsHumidity');
    let forecastWind = document.querySelectorAll('.forecastResultsWind');

    let forecastLength = data.list.length;
    let date = [];
    let wind = [];
    let icon = [];
    let temp = [];
    let humidity = [];

    for (var index = 0; index < forecastLength; index++) {
        // get the next 30 3 hour chunks of weather data... divide by 6 to get 5 "days" worth? it almost works? 
        // Open weather returns full days in chunks of 3 not which is not divisable in a 24 hour period. Figure out how to get back better datas
        if (index % 6 === 0) {
            // remove time from date
            let dateNoTime = data.list[index].dt_txt.split(' ')[0];
            // swap day/month/year in date format
            let datearray = dateNoTime.split("-");
            let fixedDate = datearray[1] + '/' + datearray[2] + '/' + datearray[0];
            date.push(fixedDate);
            icon.push(data.list[index].weather[0].icon);
            temp.push(fahrenheit);
            humidity.push(data.list[index].main.humidity);
            wind.push(data.list[index].wind.speed);

            forecastDate.forEach((el, index) => {
                forecastDate[index].innerHTML = date[index];
            });
            forecastIcon.forEach((el, index) => {
                forecastIcon[index].src = `http://openweathermap.org/img/w/${icon[index]}.png`;
            });
            forecastTemp.forEach((el, index) => {
                forecastTemp[index].innerHTML = temp[index];
            });
            forecastHumidity.forEach((el, index) => {
                forecastHumidity[index].innerHTML = humidity[index];
            });
            forecastWind.forEach((el, index) => {
                forecastWind[index].innerHTML = wind[index];
            });
        }
    }
        
    // find the forecast divs in the dom and loop thru them and add the data from each date using the index.
}


function createHistoryButton() {
    showHistoryWrapper();
    let cities = getCitiesFromStorage();
    let historyWrapper = document.querySelector('.historyWrapper');
    historyWrapper.innerHTML = '';
  
    cities.forEach((cityName) => {
      historyWrapper.innerHTML += `<button class="historyLink historyLink-${cityName}">${cityName}</button>`;
      let newButton = document.querySelector(`.historyLink-${cityName}`);
      newButton.addEventListener('click', () => showHistory(cityName));
    });
}

function removeHistoryButtons() {
    let buttonContainer = document.querySelector('.historyWrapper');
    while (buttonContainer.firstChild) {
        buttonContainer.removeChild(buttonContainer.firstChild);
    }
}

// Clear History Button 

let clearHistoryButton = document.querySelector('.clearHistory');
clearHistoryButton.addEventListener('click', () => {
    localStorage.clear();
    hideHistory();
    removeHistoryButtons();
});


function hideHistory() {
    document.querySelector('.history').classList.remove('d-block');
    document.querySelector('.history').classList.add('d-none');
}

function hideError() {
    document.querySelector('.error').classList.remove('d-block');
    document.querySelector('.error').classList.add('d-none');
}

function showError() {
    document.querySelector('.error').classList.remove('d-none');
    document.querySelector('.error').classList.add('d-block');
}

function showHistoryWrapper() {
    document.querySelector('.history').classList.remove('d-none');
    document.querySelector('.history').classList.add('d-block');
}

function showHistory(cityName) {
    let forecasts = getForecastsFromStorage();
    let forecastData = forecasts.find((data) => data.city === cityName);

    if (forecastData) {
        // Populate HTML with forecast data
        document.querySelector('.weatherResultsCity').innerHTML = forecastData.city;
        document.querySelector('.weatherResultsDate').innerHTML = forecastData.date;
        document.querySelector('.weatherResultsIcon').src = `http://openweathermap.org/img/w/${forecastData.icon}.png`;
        document.querySelector('.weatherResultsTemp').innerHTML = forecastData.temp + '&deg;';
        document.querySelector('.weatherResultsHumidity').innerHTML = forecastData.humidity + '%';
        document.querySelector('.weatherResultsWind').innerHTML = forecastData.wind + ' mph';
    }
}

document.addEventListener('readystatechange', function() {
    if (document.readyState === "complete") {
        if(localStorage.length > 0) {
            showHistoryWrapper();
            hideError();
            createHistoryButton();
        }
    }
});