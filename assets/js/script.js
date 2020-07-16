let cityList = [];
// checking for cityList array
if (!localStorage.getItem("cityList")) {
    // creating one if it doesn't exist
    localStorage.setItem("cityList", "");
} else {
    // pulling it from localStorage if it exists
    cityList = JSON.parse(localStorage.getItem("cityList"));

    // generating all the items from it on the page
    cityList.forEach((item) => {
        $("#cityUl").append($("<li>").attr({
            "class": "list-group-item cityName",
            "data-city": item
        }).text(item));
    });
}

let lastSearchedCity = "";
if (!localStorage.getItem("lastSearchedCity")) {
    // creating one if it doesn't exist
    // and setting it to Denver by default
    // so that it displays some weather at all times
    localStorage.setItem("lastSearchedCity", "Denver");
    lastSearchedCity = "Denver";
} else {
    lastSearchedCity = localStorage.getItem("lastSearchedCity");
}

/**
 * Makes decision on what icon to use
 * based on the weather received
 *
 * @param {string} weather - Current weather condition
 * @return {string} - Icon URL
 *
 * @example
 *
 *     getWeatherIcon("rain")
 */
const getWeatherIcon = (weather) => {
    switch (weather) {
        case "clear":
            return "https://duckduckgo.com/assets/weather/svg/new/clear-day.svg";
        case "clouds":
            return "https://duckduckgo.com/assets/weather/svg/new/partly-cloudy-day.svg";
        case "rain":
            return "https://duckduckgo.com/assets/weather/svg/new/rain.svg";
        default:
            // unknown weather condition
            return `https://img.shields.io/static/v1?label=w&message=${weather}&color=E63946&style=flat-square`
    }
}


/**
 * Rates the severity of the UV value received
 *
 * @param {number} uvValue - Current UV value
 * @return {string} - UV severity
 *
 * @example
 *
 *     getUVRating(5)
 */
const getUVRating = (uvValue) => {
    if (uvValue < 2) {
        return "lowUV";
    } else if (uvValue < 5) {
        return "moderateUV";
    } else if (uvValue < 7) {
        return "highUV";
    } else {
        return "veryHighUV";
    }
}

/**
 * Makes API requests and generates current
 * city weather
 *
 * @param {string} cityName - City to request the weather for
 *
 * @example
 *
 *     requestGenerateCityWeatherCurrent("Denver")
 */
const requestGenerateCityWeatherCurrent = async (cityName) => {
    // ----------- API Interaction Block ----------- \\
    // Making an API request for current weather
    const weatherCurrent = await $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        data: {
            q: cityName,
            units: "imperial",
            appid: "856d91b9f228e56edd3da6504c19f051"
        }
    });

    // Making an API request for current UV index
    const weatherUVCurrent = await $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi",
        method: "GET",
        data: {
            q: cityName,
            appid: "856d91b9f228e56edd3da6504c19f051",
            lat: weatherCurrent.coord.lat,
            lon: weatherCurrent.coord.lon
        }
    });

    // ----------- Generating Elements Block ----------- \\
    // Text for current weather span elements that will be generated
    const spanArray = [
        `Temperature: ${weatherCurrent.main.temp} °F`,
        `Humidity: ${weatherCurrent.main.humidity}%`,
        `Wind Speed: ${weatherCurrent.wind.speed} MPH`,
        `UV Index: `
    ];

    const weatherCurrentCardBody = $("#weatherCurrentCardBody");
    weatherCurrentCardBody.empty();


    // Generating an <h3> with city name and current date
    const cityTitleH3 = $("<h3>").attr("id", "weatherCurrentTitle");
    cityTitleH3.text(`${weatherCurrent.name} (${moment().format('M/D/Y')}) `);
    // adding weather icon to the title
    cityTitleH3.append($("<img>").attr("src", getWeatherIcon(weatherCurrent.weather[0].main.toLowerCase())));
    weatherCurrentCardBody.append(cityTitleH3);

    // Generating spans with weather information
    for (let item of spanArray) {
        // If dealing with the UV index span
        if (item.includes("UV")) {
            weatherCurrentCardBody.append(
                $("<span>").attr("class", `weather-span`).text(item)
                .append($("<span>").attr("class", getUVRating(weatherUVCurrent.value)).text(weatherUVCurrent.value)));
            return;
        }
        weatherCurrentCardBody.append($("<span>").attr("class", "weather-span").text(item));
    }
}


/**
 * Makes an API request and generates
 * city weather forecast for 5 days
 *
 * @param {string} cityName - City to request the weather for
 *
 * @example
 *
 *     requestGenerateCityWeatherForecast("Denver")
 */
const requestGenerateCityWeatherForecast = async (cityName) => {
    // ----------- API Interaction Block ----------- \\
    // Making an API request for weather forecast
    const weatherForecast = await $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast",
        method: "GET",
        data: {
            q: cityName,
            units: "imperial",
            appid: "856d91b9f228e56edd3da6504c19f051"
        }
    })

    // calculation average temp for 5 days and placing it in the avForecast array
    let filteredForecast = [];
    const avForecast = [];
    // for each 8 items (1 day)
    // get an average of those items (for 1 day)
    // and push to avForecast
    for (let item of weatherForecast.list) {
        // Getting temps for each item and pushing to filteredForecast
        filteredForecast.push({
            temp: item.main.temp,
            humidity: item.main.humidity,
            date: item.dt,
            weather: item.weather[0].main
        });
        // Once we have 8 items in filteredForecast
        if (filteredForecast.length === 8) {
            let dayTemp = 0;
            let dayHumidity = 0;
            let currentDate;
            let currentWeather;
            // Loop through these 8 items
            for (let i = 0; i < filteredForecast.length; i++) {
                // Calculate the average of 8 items that are already in the filteredForecast
                // the sum of temps of 8 times from 1 day
                dayTemp += filteredForecast[i].temp;
                dayHumidity += filteredForecast[i].humidity;
                currentDate = !currentDate ? filteredForecast[i].date : currentDate;
                // Using weather condition only from 12:00 PM
                currentWeather = i === 4 ? filteredForecast[i].weather : currentWeather;
            }
            // Pushing average temp (down to 2 decimals) to avForecast
            avForecast.push({
                temp: (dayTemp / 8).toFixed(2),
                humidity: Math.round((dayHumidity / 8)),
                date: moment.unix(currentDate).utc().format("M/D/Y"),
                weather: currentWeather
            });
            // Clearing filteredForecast
            filteredForecast = [];
        }
    }

    // ----------- Generating Elements Block ----------- \\
    const weatherForecastCard = $("#weatherForecastCard");
    weatherForecastCard.empty();

    for (let item of avForecast) {
        weatherForecastCard.append(
            $("<div>").attr("class", "col").append(
                $("<div>").attr("class", "card text-white bg-primary mb-3 forecastCard").append(
                    $("<div>").attr("class", "card-body").append(
                        $("<h5>").attr("class", "card-title").text(item.date), $("<img>").attr({
                            "src": getWeatherIcon(item.weather.toLowerCase()),
                            alt: `${item.weather.toLowerCase()} weather icon`
                        }),
                        $("<span>").attr("class", "card-text").text(`Temp: ${item.temp} °F`),
                        $("<span>").attr("class", "card-text").text(`Humidity: ${item.humidity}%`)

                    )
                )
            )
        );
    }
}

/**
 * clickEventListener
 * Any city from the list on the page
 * 
 * generates current weather and weather forecast
 * for that city
 */
$("#cityUl").on("click", ".cityName", (event) => {
    const cityName = $(event.target).data("city");
    lastSearchedCity = cityName;
    localStorage.setItem("lastSearchedCity", lastSearchedCity)
    requestGenerateCityWeatherForecast(cityName);
    requestGenerateCityWeatherCurrent(cityName);
});


/**
 * clickEventListener
 * Add button
 * 
 * adds entered city to cityList and localStorage,
 * displays it on the page
 */
$("#addCityButton").on("click", () => {
    event.preventDefault();
    // if no value is entered exit the function
    if (!$("#citySearchName").val()) {
        return false;
    }

    const newCity = $("#citySearchName").val().trim();
    $("#citySearchName").val("");

    // adding new city to newCity array and localStorage
    cityList.push(newCity);
    localStorage.setItem("cityList", JSON.stringify(cityList));

    // generating it on the webpage
    const newCityLi = $("<li>").attr({
        "class": "list-group-item cityName",
        "data-city": newCity
    }).text(newCity);
    $("#cityUl").append(newCityLi);

    // generating weather for the new city
    requestGenerateCityWeatherForecast(newCity);
    requestGenerateCityWeatherCurrent(newCity);
})


/**
 * clickEventListener
 * Reset button
 * 
 * resets cityList in localStorage, resets cityList array
 * removes the cities from the page
 */
$("#resetCityUlButton").on("click", () => {
    cityList = [];
    localStorage.setItem("cityList", "");
    localStorage.setItem("lastSearchedCity", "");
    $("#cityUl").empty();
});


// if there is a lastSearchedCity value
// display weather for that city
if (lastSearchedCity) {
    requestGenerateCityWeatherForecast(lastSearchedCity);
    requestGenerateCityWeatherCurrent(lastSearchedCity);
}