const apiKey = `eb0c3316618dee8ac54aab06c8526522`
const searchCityInput = document.getElementById("search-city")
const mobileSearchCityInput = document.getElementById("mobile-search-city")
const searchBtn = document.getElementById("search-btn")
const mobileSearchBtn = document.getElementById("mobile-search-btn")
const alertContainer = document.getElementById("alert")
const alertText = document.getElementsByClassName("alert-message")[0]
const autoCompleteList = document.getElementsByClassName("search-city-autocomplete")[0]

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const weatherConditions = {
    200: 'thunderstorm with light rain', 201: 'thunderstorm with rain', 202: 'thunderstorm with heavy rain',
    210: 'light thunderstorm', 211: 'thunderstorm', 212: 'heavy thunderstorm', 221: 'ragged thunderstorm',
    230: 'thunderstorm with light drizzle', 231: 'thunderstorm with drizzle', 232: 'thunderstorm with heavy drizzle',
    300: 'light intensity drizzle', 301: 'drizzle', 302: 'heavy intensity drizzle', 310: 'light intensity drizzle rain',
    311: 'drizzle rain', 312: 'heavy intensity drizzle rain', 313: 'shower rain and drizzle',
    314: 'heavy shower rain and drizzle', 321: 'shower drizzle',
    500: 'light rain', 501: 'moderate rain', 502: 'heavy intensity rain', 503: 'very heavy rain',
    504: 'extreme rain', 511: 'freezing rain', 520: 'light intensity shower rain',
    521: 'shower rain', 522: 'heavy intensity shower rain', 531: 'ragged shower rain',
    600: 'light snow', 601: 'snow', 602: 'heavy snow', 611: 'sleet',
    612: 'light shower sleet', 613: 'shower sleet', 615: 'light rain and snow',
    616: 'rain and snow', 620: 'light shower snow', 621: 'shower snow', 622: 'heavy shower snow',
    701: 'mist', 711: 'smoke', 721: 'haze', 731: 'sand/dust whirls', 741: 'fog', 751: 'sand',
    761: 'dust', 762: 'volcanic ash', 771: 'squalls', 781: 'tornado',
    800: 'clear sky', 801: 'few clouds', 802: 'scattered clouds', 803: 'broken clouds', 804: 'overcast clouds'
};

const weekDays = {
    0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
    4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

const notificationTypes = ['info', 'error', 'success', 'warning'];
let alertTimeoutId;

function callNotification(type = 'info', message = 'An error occurred', timer = 3000) {
    notificationTypes.forEach(t => alertContainer.classList.remove(t));
    alertContainer.classList.add(type);
    alertText.textContent = message;

    alertContainer.classList.add('visible');

    if (alertTimeoutId) {
        clearTimeout(alertTimeoutId);
    }

    alertTimeoutId = setTimeout(() => {
        alertContainer.classList.remove('visible');
        alertContainer.classList.remove(type);
    }, timer);
};

alertContainer.addEventListener('click', function() {
    alertContainer.classList.remove('visible');
    notificationTypes.forEach(t => alertContainer.classList.remove(t));
});

function saveLastSearch(city = '') {
    if (city != '') {
        localStorage.setItem('lastSearchedCity', city);
    }
};

searchBtn.addEventListener("click", function() {
    if (searchCityInput.value.trim().length) {
        getWeather(searchCityInput.value);
        searchCityInput.value = ''; // Clear the input after search
    } else {
        searchCityInput.parentElement.classList.add('error');
        callNotification('error', 'Please enter a city name');
    }
});

mobileSearchBtn.addEventListener("click", function() {
    if (mobileSearchCityInput.value.trim().length) {
        getWeather(mobileSearchCityInput.value);
        mobileSearchCityInput.value = ''; // Clear the input after search
    } else {
        mobileSearchCityInput.parentElement.classList.add('error');
        callNotification('error', 'Please enter a city name');
    }
});

searchCityInput.addEventListener("keydown", function(event) {
    if (event.key == 'Enter') {
        if (event.target.value.trim().length) {
            getWeather(event.target.value);
            mobileSearchCityInput.value = ''; // Clear the input after search
        } else {
            searchCityInput.parentElement.classList.add('error');
            callNotification('error', 'Please enter a city name');
        }
    }
    
    if (searchCityInput.parentElement.classList.contains('error') && event.target.value.trim().length) {
        searchCityInput.parentElement.classList.remove('error');
    }
});

mobileSearchCityInput.addEventListener("keydown", function(event) {
    if (event.key == 'Enter') {
        if (event.target.value.trim().length) {
            getWeather(event.target.value);
            mobileSearchCityInput.value = ''; // Clear the input after search
        } else {
            callNotification('error', 'Please enter a city name');
            mobileSearchCityInput.parentElement.classList.add('error');
        }
    }

    if (mobileSearchCityInput.parentElement.classList.contains('error') && event.target.value.trim().length) {
        mobileSearchCityInput.parentElement.classList.remove('error');
    }
});

function renderLoading(mainBlock, mainAside) {
    mainBlock.innerHTML = `<span class="weather-degrees">Loading...</span>`;
    
    const oldUl = mainAside.querySelector('.weather-aside-info');
    if (oldUl) oldUl.remove();

    mainAside.insertAdjacentHTML('beforeend', `
        <ul class="weather-aside-info">
            <li class="weather-aside-title">Loading weather...</li>
            <li class="weather-aside-item">Loading details...</li>
        </ul>
    `);
}

function renderWeather(mainBlock, mainAside, weatherData) {
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    const weatherId = weatherData.weather[0].id;
    const date = new Date(weatherData.dt * 1000);
    const sunset = new Date(weatherData.sys.sunset * 1000);

    const month = months[date.getMonth()];
    const weekDay = date.getUTCDay();
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = String(sunset.getHours()).padStart(2, '0');
    const minutes = String(sunset.getMinutes()).padStart(2, '0');

    const oldUl = mainAside.querySelector('.weather-aside-info');
    if (oldUl) oldUl.remove();

    const $main = document.querySelector('.main');
    $main.className = 'main';

    switch (weatherData.weather[0].main) {
        case 'Rain':
        case 'Snow':
        case 'Lightning':
            $main.classList.add('rain');
            break;
        default:
            $main.classList.add('clear');
    }

    mainBlock.innerHTML = `
        <div class="weather-degrees-sublock">
            <span class="weather-degrees">${Math.floor(weatherData.main.temp)}°</span>
            <div class="weather-degrees-info">
                <div class="weather-degrees-info-block">
                    <span class="weather-degrees-info-city">${weatherData.name}</span>
                    <span class="weather-degrees-info-date">${hours}:${minutes} - ${weekDays[weekDay]}, ${day} ${month} ${year}</span>
                </div>
                <img class="weather-degrees-info-icon" src="${weatherIcon}" alt="weather">
            </div>
        </div>
    `;

    mainAside.insertAdjacentHTML('beforeend', `
        <ul class="weather-aside-info">
            <li class="weather-aside-title">${weatherConditions[weatherId]}</li>
            <li class="weather-aside-item">
                <span class="weather-aside-subtitle">Temp max</span>
                <span class="weather-aside-description">${Math.floor(weatherData.main.temp_max)}° <img src="./images/max-temp.svg" alt="Temp max icon"></span>
            </li>
            <li class="weather-aside-item">
                <span class="weather-aside-subtitle">Temp min</span>
                <span class="weather-aside-description">${Math.floor(weatherData.main.temp_min)}° <img src="./images/min-temp.svg" alt="Temp min icon"></span>
            </li>
            <li class="weather-aside-item">
                <span class="weather-aside-subtitle">Humidity</span>
                <span class="weather-aside-description">${weatherData.main.humidity}% <img src="./images/humidity.svg" alt="Humidity icon"></span>
            </li>
            <li class="weather-aside-item">
                <span class="weather-aside-subtitle">Cloudy</span>
                <span class="weather-aside-description">${weatherData.clouds.all}% <img src="./images/clouds.svg" alt="Clouds icon"></span>
            </li>
            <li class="weather-aside-item">
                <span class="weather-aside-subtitle">Wind</span>
                <span class="weather-aside-description">${weatherData.wind.speed} m/s <img src="./images/wind.svg" alt="Wind icon"></span>
            </li>
        </ul>
    `);
}

async function getWeather(city) {
    const mainBlock = document.getElementById("main-block");
    const mainAside = document.getElementById("main-aside");

    renderLoading(mainBlock, mainAside);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&cnt=1&units=metric&lang=en`);
        const data = await response.json();

        if (data.cod !== 200) {
            callNotification('error', data.message || 'Enter the name of the City');
            if (data.message == 'city not found' && localStorage.getItem('lastSearchedCity')) {
                getWeather(localStorage.getItem('lastSearchedCity'));
            }
            return;
        }

        renderWeather(mainBlock, mainAside, data);
        saveLastSearch(city);

    } catch (error) {
        callNotification('warning', error.message);
    }
}

//cities autocomplete
let cities = [];
fetch('cities.json')
    .then(response => response.json())
    .then(data => {
        cities = data;
    })
    .catch(error => console.error('Ошибка загрузки JSON:', error));

searchCityInput.addEventListener("input", function() {
    const input = this.value.toLowerCase();
    autoCompleteList.innerHTML = '';
    autoCompleteList.classList.add('active');

    const matches = cities.filter(city => city.toLowerCase().startsWith(input)).slice(0, 5);

    matches.forEach(city => {
        const li = document.createElement("li");
        li.classList.add('search-city-autocomplete-item')
        li.textContent = city;
        li.addEventListener("click", () => {
            searchCityInput.value = city;
            autoCompleteList.innerHTML = '';
            autoCompleteList.classList.remove('active');
        });
        autoCompleteList.append(li);
    });
});

document.addEventListener("click", function(event) {
    if (autoCompleteList.classList.contains('active') && !autoCompleteList.contains(event.target) && event.target !== searchCityInput) {
        autoCompleteList.classList.remove('active');
    }
});

//cities autocomplete end

//get weather with location
if (!localStorage.getItem('lastSearchedCity') && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        getWeather('', position.coords.latitude, position.coords.longitude);
    }, () => {
        getWeather(localStorage.getItem('lastSearchedCity') || 'Bishkek'); //on error or user denied, use last searched city or default
    })
} else {
    getWeather(localStorage.getItem('lastSearchedCity') || 'Bishkek'); // Default city if no last search is saved
}
