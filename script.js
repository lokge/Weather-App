let apiKey = `eb0c3316618dee8ac54aab06c8526522`
let searchCityInput = document.getElementById("search-city")
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const weatherConditions = {
    200: 'thunderstorm with light rain',
    201: 'thunderstorm with rain',
    202: 'thunderstorm with heavy rain',
    210: 'light thunderstorm',
    211: 'thunderstorm',
    212: 'heavy thunderstorm',
    221: 'ragged thunderstorm',
    230: 'thunderstorm with light drizzle',
    231: 'thunderstorm with drizzle',
    232: 'thunderstorm with heavy drizzle',

    300: 'light intensity drizzle',
    301: 'drizzle',
    302: 'heavy intensity drizzle',
    310: 'light intensity drizzle rain',
    311: 'drizzle rain',
    312: 'heavy intensity drizzle rain',
    313: 'shower rain and drizzle',
    314: 'heavy shower rain and drizzle',
    321: 'shower drizzle',

    500: 'light rain',
    501: 'moderate rain',
    502: 'heavy intensity rain',
    503: 'very heavy rain',
    504: 'extreme rain',
    511: 'freezing rain',
    520: 'light intensity shower rain',
    521: 'shower rain',
    522: 'heavy intensity shower rain',
    531: 'ragged shower rain',

    600: 'light snow',
    601: 'snow',
    602: 'heavy snow',
    611: 'sleet',
    612: 'light shower sleet',
    613: 'shower sleet',
    615: 'light rain and snow',
    616: 'rain and snow',
    620: 'light shower snow',
    621: 'shower snow',
    622: 'heavy shower snow',

    701: 'mist',
    711: 'smoke',
    721: 'haze',
    731: 'sand/dust whirls',
    741: 'fog',
    751: 'sand',
    761: 'dust',
    762: 'volcanic ash',
    771: 'squalls',
    781: 'tornado',

    800: 'clear sky',

    801: 'few clouds',
    802: 'scattered clouds',
    803: 'broken clouds',
    804: 'overcast clouds'
};

const weekDays = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

searchCityInput.addEventListener("blur", function(event) {
    if (event.target.value !== '') {
        getWeather(event.target.value);
    }
});

searchCityInput.addEventListener("keydown", function(event) {
    if (event.key == 'Enter' && event.target.value !== '') {
        getWeather(event.target.value);
    }
});

async function getWeather(city) {
    let weatherData = {};
    let mainBlock = document.getElementById("main-block");
    let mainAside = document.getElementById("main-aside");
    // https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric
    // https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&cnt=1&units=metric&lang=en

    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&cnt=1&units=metric&lang=en`)
        .then((res) => {
            return res.json()
        }).then((data) => {
            if (data.cod !== 200) {
                alert(`Error: ${data.message}`);
                return;
            } else {
                weatherData = data;
            }
        });

    if (weatherData) {
        let weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
        let weatherId = weatherData.weather[0].id;
        let date = new Date(weatherData.dt * 1000);
        let time = new Date(weatherData.sys.sunset * 1000);
        let month = months[date.getMonth()];
        let weekDay = date.getUTCDay();
        let day = date.getDate();
        let year = date.getFullYear();
        let hours = String(time.getHours()).padStart(2, '0');
        let minutes = String(time.getMinutes()).padStart(2, '0');

        const oldUl = mainAside.querySelector('.weather-aside-info');
        if (oldUl) oldUl.remove();

        let $main = document.querySelector('.main');

        switch (weatherData.weather[0].main) {
            case 'Rain': $main.classList.add('rain');
                break;
            case 'Snow': $main.classList.add('rain');
                break;
            case 'Lightning': $main.classList.add('rain');
                break;
            default: $main.classList.add('clear');
                break;
        }

        mainBlock.innerHTML = `
            <span class="weather-degrees">${Math.floor(weatherData.main.temp)}°</span>
            <div class="weather-degrees-info">
                <div class="weather-degrees-info-block">
                    <span class="weather-degrees-info-city">${weatherData.name}</span>
                    <span class="weather-degrees-info-date">${hours}:${minutes} - ${weekDays[weekDay]}, ${day} ${month} ${year}</span>
                </div>
                <img class="weather-degrees-info-icon" src="${weatherIcon}" alt="weather">
            </div>
        `

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
                    <span class="weather-aside-description">${weatherData.clouds.all}% <img src="./images/clouds.svg" alt="Clouds icon"> </span>
                </li>
                <li class="weather-aside-item">
                    <span class="weather-aside-subtitle">Wind</span>
                    <span class="weather-aside-description">${weatherData.wind.speed} m/s <img src="./images/wind.svg" alt="Wind icon"> </span>
                </li>
            </ul>
        `);
    }
}


getWeather('Bishkek')