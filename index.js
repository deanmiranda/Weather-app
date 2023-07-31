
const weatherButton = document.querySelector(".checkWeatherButton");
weatherButton.addEventListener('click', callWeather);

const weather = document.querySelector('.weatherResults');
let fahrenheit;

const clearStorageButton = document.querySelector(".clearHistory");
clearStorageButton.addEventListener('click', clearHistory);

let history = document.querySelector('.history');
let historyLinks = document.querySelectorAll('.historyLink');
let historyLinksLength = historyLinks.length;

// Creating Stores
let localStore = localStorage.getItem("Locations");
var localStoreParsed = JSON.parse(localStore);

if(localStoreParsed) {
    showHistory(localStoreParsed);
    createHistoryButton(localStore);
}

// Use weather API
function callWeather(e) {
    e.preventDefault();
    const APP_API = '8c2815b4840aae521bf9478cec747275';
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
    }).catch(function(err) {
        console.log('City not found, please try again.', err);
    });
}

// Function to change kelvin to fahrenheit
function convertTemp(d) {
	fahrenheit = Math.round(((parseFloat(d.list[0].main.temp)-273.15)*1.8)+32); 
}

// Need to get data for future and current Weather for the city

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

    // Populate HTML
	document.querySelector('.weatherResultsCity').innerHTML = d.city.name;
    document.querySelector('.weatherResultsDate').innerHTML = fixedDate;
	document.querySelector('.weatherResultsIcon').src = `http://openweathermap.org/img/w/${d.list[0].weather[0].icon}.png`;
    document.querySelector('.weatherResultsTemp').innerHTML = fahrenheit + '&deg;';
    document.querySelector('.weatherResultsHumidity').innerHTML = d.list[0].main.humidity + '%';
    document.querySelector('.weatherResultsWind').innerHTML = d.list[0].wind.speed + ' mph';

    // Set data to storage
    storeLocations(d.city.name)
    store(d.city.name);
    store(newDate);
    store(d.list[0].weather[0].icon);
    store(fahrenheit);
    store(d.list[0].main.humidity);
    store(d.list[0].wind.speed);

    // create a for each loop and distribute the data across an array for the 5 day forecast

    buildForecastList(d);
}

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
    createHistoryButton();

    for (var index = 0; index < forecastLength; index++) {
        // get the next 30 3 hour chunks of weather data... divide by 6 to get 5 "days" worth? it almost works? 
        // Open weather returns full days in chunks of 3 not which is not divisable in a 24 hour period. Figure out how to get back better datas
        if (index % 6 === 0) {
            // remove time from date
            let dateNoTime = data.list[index].dt_txt.split(' ')[0];
            // swap day/month/year in date format
            let datearray = dateNoTime.split("-");
            let fixedDate = datearray[1] + '/' + datearray[2] + '/' + datearray[0];
            
            // Update Arrays and Local storage
            date.push(fixedDate);
            storeForecast(fixedDate);

            icon.push(data.list[index].weather[0].icon);
            storeForecast(data.list[index].weather[0].icon);

            temp.push(fahrenheit);
            storeForecast(fahrenheit);

            humidity.push(data.list[index].main.humidity);
            storeForecast(data.list[index].main.humidity);

            wind.push();
            storeForecast(data.list[index].wind.speed);

            // Populate HTML fields
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
    // console.log('stored weather object', weatherForecast);
        
    // find the forecast divs in the dom and loop thru them and add the data from each date using the index.
}

function createHistoryButton() {
    showHistory();
    // get city name to add to button
    let locationsStore = localStorage.getItem("Locations");
    var locationsStoreParsed = JSON.parse(locationsStore);
    if (Array.isArray(locationsStoreParsed)) {
        let locationsStoreLength = locationsStoreParsed.length;
        // Use locationsStoreParsed and locationsStoreLength as needed
        for(var index = 0; index < locationsStoreLength; index++) {
            let cityName = locationsStoreParsed.slice(-1);
            console.log('show name of stored cities', cityName);
            let newButton = document.querySelector(`.historyLink-${cityName}`);
            let historyWrapper = document.querySelector('.historyWrapper');
            historyWrapper.innerHTML +=`<button class="historyLink historyLink-${cityName}">${cityName}</button>`;
            newButton.addEventListener('click', showHistory(locationsStoreParsed[index]));
        }
      } else {
        console.log('no locations stored');
      }
}
// Create button from search history and populate html with data from local storage.

var weatherToday = [];
var weatherForecast = [];
var weatherLocations = [];

function store(item) {
    weatherToday.push(item);
    localStorage.setItem("Today", JSON.stringify(weatherToday));
}

function storeForecast(item) {
    weatherForecast.push(item);
    localStorage.setItem("Forecast", JSON.stringify(weatherForecast));
}

function storeLocations(item) { 
    weatherLocations.push(item);
    localStorage.setItem("Locations", JSON.stringify(weatherLocations));
}

// Need 5 day forecast
//  .weatherFutureButton shouldn't call the API again.. only use the data thats currently available to produce 5 day look ahead


function showHistory(name) {
    // Remove display none from div
    const history = document.querySelector('.history');
    console.log('it works', name);
    history.classList.remove('d-none');
}

function clearHistory() {
    history.classList.add('d-none');
    localStorage.clear();
    sessionStorage.clear();
}


// Current issues 
// Clear Storage is clearing the browser storage but it isn't working on click because the arrays are saving the data.

// I'm not getting the city name correclty on the Search history buttons when I populate the button, I need to figure out how to "getItem" from local storage for the buttons
// After that I can repopulate the today/5-day forecast in the main container.
