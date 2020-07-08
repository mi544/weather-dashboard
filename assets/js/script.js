function requestCityWeather() {
    var city = $(this).text();
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=856d91b9f228e56edd3da6504c19f051`

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .then(function (response) {
            var dayTemp = 0;
            var listTemp = [];
            var listAvTemp = [];
            // for each 8 items (1 day)
            // get an average of those items
            for (var i = 0; i < response.list.length; i++) {
                // Getting temps for each item and pushing to listTemp
                listTemp.push(response.list[i].main.temp);
                if (listTemp.length === 8) {
                    // Once we have 8 items in listTemp
                    for (var j = 0; j < listTemp.length; j++) {
                        // Calculate the average of 8 items that are already in the listTemp
                        dayTemp += listTemp[j];
                    }
                    // Pushing average temp to listAvTemp
                    listAvTemp.push(dayTemp / 8);
                    // Clearing listTemp
                    listTemp = [];
                    dayTemp = 0;
                }
            }
            console.log(listAvTemp);



        })
}

$("#cityUl").on("click", ".cityName", requestCityWeather);