
const weatherButton = document.querySelector(".checkWeatherButton");
weatherButton.addEventListener('click', callWeather);
const weather = document.querySelector('.weatherResults');
weather.classList.remove('d-none');

function callWeather(e) {
    e.preventDefault();
    let cityInput = document.querySelector(".cityInput").value;
    let apiLink = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&cnt=5&appid=8c2815b4840aae521bf9478cec747275`;

    fetch(apiLink).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        drawWeather(data);
    }).catch(function(err) {
        alert('City not found, please try again.');
    });
}

function drawWeather(d) {
    const checkForecastButton = document.querySelector('.checkForecastButton');
    checkForecastButton.classList.remove('d-none');
    checkForecastButton.addEventListener('click', showForecast);

    // Function to change kelvin to fahrenheit
	var fahrenheit = Math.round(((parseFloat(d.list[0].main.temp)-273.15)*1.8)+32); 

    // Html changes
    // Changing time from date.time now to time in city using offset, needs fix for offset, showing three hours early
    date = new Date()
    localTime = date.getTime()
    localOffset = date.getTimezoneOffset() * d.city.timezone;
    utc = localTime + localOffset
    var newTime = utc + (1000 * d.city.timezone)
    var newDate = new Date(newTime);
    // Changing the icon to the weather icon from data

    // Add the below data points to my local storage.

	document.querySelector('.weatherResultsCity').innerHTML = d.city.name;
    document.querySelector('.weatherResultsDate').innerHTML = newDate;
    // time date is not working as expected needs review.
	document.querySelector('.weatherResultsIcon').src = `http://openweathermap.org/img/w/${d.list[0].weather[0].icon}.png`;
    document.querySelector('.weatherResultsTemp').innerHTML = fahrenheit + '&deg;';
    document.querySelector('.weatherResultsHumidity').innerHTML = d.list[0].main.humidity + '%';
    document.querySelector('.weatherResultsWind').innerHTML = d.list[0].wind.speed + ' mph';

    localStorage.setItem('city', d.city.name);
    localStorage.setItem('date', newDate);
    localStorage.setItem('icon', d.list[0].weather[0].icon);
    localStorage.setItem('temp', fahrenheit);
    localStorage.setItem('humidity', d.list[0].main.humidity);
    localStorage.setItem('wind', d.list[0].wind.speed);


    // create a for each loop and distribute the data across an array for the 5 day forecast

    // // 
    // let forecast = data.city.list;
    // forecast.forEach(function (day, index) {
    //     console.log(day);
    //     console.log(index);
    // });
}

function showForecast() {
    const forecast = document.querySelector('.forecastResults');
    console.log('should show forecast');
    forecast.classList.remove('d-none');
}

// Need 5 day forecast
//  .weatherFutureButton shouldn't call the API again.. only use the data thats currently available to produce 5 day look ahead

// Need future and current Weather for the city