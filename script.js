const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryText = document.querySelector('.country-text');
const tempText = document.querySelector('.temp-text');
const conditionText = document.querySelector('.condition-text');
const humidityValueText = document.querySelector('.humidity-value-text');
const windValueText = document.querySelector('.wind-value-text');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateText = document.querySelector('.current-date-text');

const forecastItemContainer = document.querySelector('.forecast-items-container');

const apiKey = '48d8058a2da3abc706b11517d77d9916';


searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});


cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endPoint, city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return { cod: 500 };
    }
}

function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg';
    if (id >= 300 && id <= 321) return 'drizzle.svg';
    if (id >= 500 && id <= 531) return 'rain.svg';
    if (id >= 600 && id <= 622) return 'snow.svg';
    if (id >= 701 && id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    if (id >= 801 && id <= 804) return 'cloud.svg';
    return 'unknown.svg';
}

function getCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return now.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: countryName,
        sys: { country: countryCode },
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryText.innerHTML = `${countryName} <img src="https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png" alt="${countryCode}" style="margin-left:6px;">`;
    tempText.textContent = Math.round(temp) + '°C';
    conditionText.textContent = main;
    humidityValueText.textContent = humidity + '%';
    windValueText.textContent = speed + ' M/s';
    currentDateText.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastInfo(city);
    showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);

    if (!forecastData || !forecastData.list) return;

    const dailyForecastMap = {};

    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyForecastMap[date]) {
            dailyForecastMap[date] = item; 
        }
    });

    const today = new Date().toISOString().split('T')[0];

    forecastItemContainer.innerHTML = '';

    Object.keys(dailyForecastMap).forEach(date => {
        if (date !== today) {
            updateForecastItems(dailyForecastMap[date]);
        }
    });
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id, icon }],
        main: { temp }
      } = weatherData;
      

    const datetaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = datetaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" alt="icon">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem);
}


function showDisplaySection(targetSection) {
    const allSections = [weatherInfoSection, searchCitySection, notFoundSection];
    allSections.forEach(sec => sec.style.display = 'none');
    targetSection.style.display = 'flex';
}
