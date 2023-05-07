
const weatherButton = document.querySelector(".weatherButton");


weatherButton.addEventListener('click', function() {
    callWeather();
});

function callWeather() {
    let cityInput = document.querySelector(".cityInput").value;
    // this is where I should put the weather api key
    let apiLink = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&cnt=5&appid=(removeparenthesis and put openweather key here)`;

    fetch(apiLink).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log('this is the data', data);
        drawWeather(data);
    }).catch(function(err) {
        alert('City not found, please try again.');
	    console.warn('Something went wrong.', err);
    });
}

function drawWeather(d) {
    console.log('drawWeather function');
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
 
}

// Need 5 day forecast
//  .weatherFutureButton shouldn't call the API again.. only use the data thats currently available to produce 5 day look ahead

// Need future and current Weather for the city