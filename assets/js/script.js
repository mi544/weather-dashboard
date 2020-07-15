const requestGenerateCityWeatherCurrent = async (cityName) => {
    // ----------- API Interaction Block -----------
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

    // ----------- Generating Elements Block -----------
    const spanArray = [
        `Temperature: ${weatherCurrent.main.temp} °F`,
        `Humidity: ${weatherCurrent.main.humidity}%`,
        `Wind Speed: ${weatherCurrent.wind.speed} MPH`,
        // TODO ADD A RED BOX IF TOO MUCH OR YELLOW IF NOT REALLY
        `UV Index: ${weatherUVCurrent.value}`
    ];

    const weatherCurrentCard = $("#weatherCurrentCard");
    weatherCurrentCard.empty();

    // TODO ADD A WEATHER ICON
    // Generating an <h3> with city name and current date
    weatherCurrentCard.append($("<h3>").attr("id", "weatherCurrentTitle").text(`${weatherCurrent.name} (${moment().format('M/D/Y')})`));

    // Generating spans with weather information
    for (let item of spanArray) {
        weatherCurrentCard.append($("<span>").attr("class", "weather-span").text(item));
    }
}


const requestGenerateCityWeatherForecast = async (cityName) => {
    // ----------- API Interaction Block -----------
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
            date: item.dt
        });

        // Once we have 8 items in filteredForecast
        if (filteredForecast.length === 8) {
            let dayTemp = 0;
            let dayHumidity = 0;
            let currentDate;
            // Loop through these 8 items
            for (let item2 of filteredForecast) {
                // Calculate the average of 8 items that are already in the filteredForecast
                // the sum of temps of 8 days
                dayTemp += item2.temp;
                dayHumidity += item2.humidity;
                currentDate = !currentDate ? item2.date : currentDate;
            }
            // Pushing average temp (down to 2 decimals) to avForecast
            avForecast.push({
                temp: (dayTemp / 8).toFixed(2),
                humidity: Math.round((dayHumidity / 8)),
                date: moment.unix(currentDate).format("M/D/Y")
            });
            // Clearing filteredForecast
            filteredForecast = [];
        }
    }

    // !C
    console.log("av temp 5 days", avForecast);

    // ----------- Generating Elements Block -----------
    const weatherForecastCard = $("#weatherForecastCard");
    weatherForecastCard.empty();

    for (let item of avForecast) {
        weatherForecastCard.append(
            $("<div>").attr("class", "col").append(
                $("<div>").attr("class", "card text-white bg-primary mb-3 forecastCard").append(
                    $("<div>").attr("class", "card-body").append(
                        $("<h5>").attr("class", "card-title").text(`${item.date}`),
                        $("<img>").attr({
                            "src": "weather icon link here",
                            alt: "alt text"
                        }),
                        $("<span>").attr("class", "card-text").text(`Temp: ${item.temp} °F`),
                        $("<span>").attr("class", "card-text").text(`Humidity: ${item.humidity}%`)

                    )
                )
            )
        );
    }
}

$("#cityUl").on("click", ".cityName", function () {
    const cityName = $(this).text();
    // !C
    // TODO add data attr
    console.log(cityName);
    requestGenerateCityWeatherForecast(cityName);
    requestGenerateCityWeatherCurrent(cityName);
});



// switch case for weather condition (if 2 rain out of 8 then rainy day, if 1 then mixed, if cloud then cloud)