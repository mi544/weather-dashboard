const requestCityWeatherCurrent = async (cityName) => {
    const weatherCurrent = await $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        data: {
            q: cityName,
            units: "imperial",
            appid: "856d91b9f228e56edd3da6504c19f051"
        }
    });

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

    const spanArray = [
        `Temperature: ${weatherCurrent.main.temp} °F`,
        `Humidity: ${weatherCurrent.main.humidity}%`,
        `Wind Speed: ${weatherCurrent.wind.speed} MPH`,
        // TODO ADD A RED BOX IF TOO MUCH OR YELLOW IF NOT REALLY
        `UV Index: ${weatherUVCurrent.value}`
    ];

    const weatherCurrentCard = $("#weatherCurrentCard");
    weatherCurrentCard.empty();

    // !C
    console.log("Current weather", weatherCurrent);

    // TODO ADD A WEATHER ICON
    // Generating an <h3> with city name and current date
    weatherCurrentCard.append($("<h3>").attr("id", "weatherCurrentTitle").text(`${weatherCurrent.name} (${moment().format('M/D/Y')})`));

    // Generating spans with weather information
    for (let item of spanArray) {
        weatherCurrentCard.append($("<span>").attr("class", "weather-span").text(item));
    }
}


const requestCityWeather5Days = async (cityName) => {
    const weather5Days = await $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast",
        method: "GET",
        data: {
            q: cityName,
            units: "imperial",
            appid: "856d91b9f228e56edd3da6504c19f051"
        }
    })

    // !C
    console.log(weather5Days);

    // calculation average temp for 5 days and placing it in the listAvTemp array
    let listTemp = [];
    const listAvTemp = [];
    // for each 8 items (1 day)
    // get an average of those items (for 1 day)
    // and push to listAvTemp
    for (let i = 0; i < weather5Days.list.length; i++) {
        // Getting temps for each item and pushing to listTemp
        listTemp.push(weather5Days.list[i].main.temp);

        // Once we have 8 items in listTemp
        if (listTemp.length === 8) {
            let dayTemp = 0;
            // Loop through these 8 items
            for (let j = 0; j < listTemp.length; j++) {
                // Calculate the average of 8 items that are already in the listTemp
                // the sum of temps of 8 days
                dayTemp += listTemp[j];
            }
            // Pushing average temp (down to 2 decimals) to listAvTemp
            listAvTemp.push((dayTemp / 8).toFixed(2));
            // Clearing listTemp
            listTemp = [];
        }
    }
    // !C
    console.log("av temp 5 days", listAvTemp);
}

$("#cityUl").on("click", ".cityName", function () {
    const cityName = $(this).text();
    // !C
    console.log(cityName);
    requestCityWeather5Days(cityName);
    requestCityWeatherCurrent(cityName);
});



// switch case for weather condition (if 2 rain out of 8 then rainy day, if 1 then mixed, if cloud then cloud)