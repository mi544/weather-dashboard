var city = "";

function requestCityWeather() {
    $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast",
            method: "GET",
            data: {
                q: city,
                units: "imperial",
                appid: "856d91b9f228e56edd3da6504c19f051"
            }
        })
        .then(function (response) {
            console.log(response);

            // calculation average temp for 5 days and placing it in the listAvTemp array
            var dayTemp = 0;
            var listTemp = [];
            var listAvTemp = [];
            // for each 8 items (1 day)
            // get an average of those items (for 1 day)
            // and push to listAvTemp
            for (var i = 0; i < response.list.length; i++) {
                // Getting temps for each item and pushing to listTemp
                listTemp.push(response.list[i].main.temp);

                // Once we have 8 items in listTemp
                if (listTemp.length === 8) {
                    // Loop through these 8 items
                    for (var j = 0; j < listTemp.length; j++) {
                        // Calculate the average of 8 items that are already in the listTemp
                        // the sum of temps of 8 days
                        dayTemp += listTemp[j];
                    }
                    // Pushing average temp to listAvTemp
                    listAvTemp.push(dayTemp / 8);
                    // Clearing listTemp
                    listTemp = [];
                    dayTemp = 0;
                }
            }
        })
}

$("#cityUl").on("click", ".cityName", function () {
    city = $(this).text();
    console.log(city);
    requestCityWeather();
});



// switch case for weather condition (if 2 rain out of 8 then rainy day, if 1 then mixed, if cloud then cloud)