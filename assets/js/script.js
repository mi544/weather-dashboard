function requestCityWeather() {
    console.log($(this));
    var city = $(this).text();
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=856d91b9f228e56edd3da6504c19f051`

    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .then(function (response) {
            console.log(response);
        })
}

$("#cityUl").on("click", ".cityName", requestCityWeather);