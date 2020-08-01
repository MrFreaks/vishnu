console.clear();
$(document).ready(function() {
   var metric = true;
   var date;
   var json;
   //check that geolocation feature supported by browser
   if ("geolocation" in navigator) {
      console.log("Geolocation supported");
   } else {
      console.log("Geolocation not supported");
      throw new Error("User does not support geolocation");
   }

   //get location
   navigator.geolocation.getCurrentPosition(success, error, {
      timeout: 20000,
      maximumAge: 0,
      enableHighAccuracy: false
   });


   // extract longitude and latitude
   function success(position) {
      $(".loading-display").css("visibility", "hidden");
      var longitude = position.coords.longitude.toFixed(4);
      var latitude = position.coords.latitude.toFixed(4);
      console.log(
         "Coordinates are Longitude: " + longitude + " Latitude: " + latitude
         );

      //get weather data from DarkSky as JSON array
      var darkSkyURL = "https://api.darksky.net/forecast/d77118a60fbebfa1cb5a648f42f623a9/";
      var callback = "?callback=?"; // makes it a jsonP request

      var requestURL = darkSkyURL + latitude + "," + longitude + callback;
      console.log(requestURL);
      // fetch json data from Dark Sky API
      $.getJSON(requestURL, function(result) {
         json = result;
         // split timezone array, format is Country/city
         var locArray = json.timezone.split("/");

         $(".loc-name").html(locArray[1] + ", " + locArray[0]);
         $(".coordinates").html(
            "Latitude: " + latitude + " and Longitude: " + longitude
            );
         //show icons
         $(".small-icon").css("visibility","visible");
         //get temperature
         setTemp(json.currently.temperature, metric);

         //get description
         var currDesc = json.currently.summary;
         $(".curr-description").html(currDesc);

         var iconDesc = json.currently.icon;
         console.log("DS: " + iconDesc)
         switch(iconDesc){
            case "clear-day": {
               iconDesc = "day-sunny";
               $(".wi").css("color", "rgb(246, 195, 87)");
               break;
            }
            case "clear-night": {iconDesc = "night-clear"; break;}
            case "rain": {iconDesc = "rain"; $(".wi").css("color", "rgb(183 ,219 ,241)"); break;}
            case "snow": {iconDesc = "now"; break;}
            case "sleet": {iconDesc = "sleet"; break;}
            case "fog": {iconDesc = "fog"; break;}
            case "cloudy": {iconDesc = "cloudy"; break;}
            case "partly-cloudy-day": {iconDesc = "day-cloudy"; break;}
            case "partly-cloudy-night": {iconDesc = "night-cloudy"; break;}
            case "hail": {iconDesc = "hail"; break;}
            case "thunderstorm": {iconDesc = "thunderstorm"; break;}
            case "tornado": {iconDesc = "tornado"; break;}
            default:  iconDesc = "day-sunny";
         }
         $(".wi").addClass("wi-" + iconDesc);
         $(".wi").css("visibility", "visible");
         $(".hour-description").html(json.hourly.summary);

         //get time
         date = new Date(json.currently.time*1000);
         var month = date.getMonth();
         var monthNames = ["January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"
         ];
         $(".time").html(date.getDay() + " " + monthNames[month]  + " " + date.getFullYear());

         // get chance of rain
         $(".precip").html(json.currently.precipProbability.toFixed(1)*100 + "%");

         // wind speed
         $(".wind").html((json.currently.windSpeed/3.6).toFixed(1) + " m/s");

         //sunset time
         var sunsetTime = new Date(json.daily.data[0].sunsetTime*1000);
         $(".sunset").html(sunsetTime.getHours()%12 + ':' + sunsetTime.getMinutes());

         //cloud cover
         $(".clouds").html(json.currently.cloudCover.toFixed(1)*100 + "%");

         // Create Weather Chart
         createChart();

         // reveal chart labels
         $(".graph-legend").css("visibility", "visible");

         // when F button pressed, change to Farenheight
         $(".faren").on("click", function() {
            metric = false;
            $(".faren").css({ color: "grey", "pointer-events": "none" });
            $(".celsius").css({ color: "#b3b3b3", "pointer-events": "auto" });
            setTemp(json.currently.temperature, metric);
            createChart();
         });

         // when C button pressed, change to Celsius
         $(".celsius").on("click", function() {
            metric = true;
            $(".celsius").css({ color: "grey", "pointer-events": "none" });
            $(".faren").css({ color: "#b3b3b3", "pointer-events": "auto" });
            setTemp(json.currently.temperature, metric);
            createChart();
         });
      });
   }
   function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      $(".loading-display").html("<br>Cannot your find location, <br> Please enable location tracking <br> <a href='javascript:window.location.href=window.location.href'>Refresh Page</a>");
   }

   // function that toggles temperature display for selected temp scale.
   function setTemp(temp, metric) {
      if (metric) {
         temp = ((temp - 32) * 5 / 9).toFixed(0) + "°C";
      } else {
         temp = temp.toFixed(0) + "°F";
      }
      $(".current-temp").html(temp);
      $(".temp-format").css("visibility", "visible");
   }

   function createChart(){
      var hour = date.getHours();
      var hourLabels = [0, 0, 0, 0, 0, 0, 0, 0];
      var tempData   = [0, 0, 0, 0, 0, 0, 0, 0];
      var rainData   = [0, 0, 0, 0, 0, 0, 0, 0];
      var windData   = [0, 0, 0, 0, 0, 0, 0, 0];

      for(var i = 0; i < hourLabels.length; i++){
         var tfhour = (hour + i)%24;
         var twhour = tfhour%12;
         if(tfhour > 11 && tfhour != 24) twhour += " pm";
         else {
            if(tfhour == 0) twhour = 12;
            twhour += " am";
         }
         hourLabels[i] = (twhour);
         var hTemp = json.hourly.data[i].temperature;
         if(metric){
            hTemp = ((hTemp - 32) * 5 / 9);
         }
         tempData[i] = hTemp.toFixed(2);
         rainData[i] = json.hourly.data[i].precipProbability*100;
         windData[i] = (json.hourly.data[i].windSpeed/3.6).toFixed(3);
      }
      var tempEl = document.getElementById("temp-chart");
      var rainEl = document.getElementById("rain-chart");
      var windEl = document.getElementById("wind-chart");

      var tempChart = new Chart(tempEl, {
         type: 'line',
         data: {
            labels: hourLabels,
            datasets:[{
               label: 'temp',
               data: tempData,
               borderColor: 'rgb(246 ,  191 ,  77 )' ,
               borderWidth:1,
               backgroundColor: 'rgba(246 ,191 ,  77 , 0.2)',
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
               boxWidth: 0,
               display: false,
            },
            scales: {
               yAxes: [{
                  ticks: {
                     fontSize: 10
                  },
                  scaleLabel: {
                  display: true,
                  labelString: ' ',
                  fontSize: 10
                  }
               }],
               xAxes: [{
                  ticks: {
                     fontSize: 10
                  }
               }],
            }
         }
      });
      var rainChart = new Chart(rainEl, {
         type: 'line',
         data: {
            labels: hourLabels,
            datasets:[{
               label: 'Rain',
               data: rainData,
               borderColor: '#55AADD' ,
               borderWidth:1,
               backgroundColor: 'rgba(85,170,221, 0.2)',
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
               boxWidth: 0,
               display: false,
            },
            scales: {
               yAxes: [{
                  ticks: {
                     fontSize: 10
                  },
                  scaleLabel: {
                  display: true,
                  labelString: '%',
                  fontSize: 10
                  }
               }],
               xAxes: [{
                  ticks: {
                     fontSize: 10
                  }
               }],
            }
         }
      });
      var windChart = new Chart(windEl, {
         type: 'line',
         data: {
            labels: hourLabels,
            datasets:[{
               label: 'Wind',
               data: windData,
               borderWidth:1,
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
               boxWidth: 0,
               display: false,
            },
            scales: {
               yAxes: [{
                  ticks: {
                     fontSize: 10,
                     stepSize: 1
                  },
                  scaleLabel: {
                  display: true,
                  labelString: 'm/s',
                  fontSize: 10
                  }
               }],
               xAxes: [{
                  ticks: {
                     fontSize: 10
                  }
               }],
            }
         }
      });
   }

   // toggle visibility of graphs in bottom container
   $(".wind-label").on("click", function(){
      $(".temp-label, .rain-label").addClass("label-off"); // unselect other labels
      $(".wind-label").removeClass("label-off");
      $(".temp-chart, .rain-chart").addClass("chart-hidden"); // hide other charts
      $(".wind-chart").removeClass("chart-hidden");
   });
   $(".rain-label").on("click", function(){
      $(".temp-label, .wind-label").addClass("label-off"); // unselect other labels
      $(".rain-label").removeClass("label-off");
      $(".temp-chart, .wind-chart").addClass("chart-hidden"); // hide other charts
      $(".rain-chart").removeClass("chart-hidden");
   });
   $(".temp-label").on("click", function(){
      $(".rain-label, .wind-label").addClass("label-off"); // unselect other labels
      $(".temp-label").removeClass("label-off");
      $(".rain-chart, .wind-chart").addClass("chart-hidden"); // hide other charts
      $(".temp-chart").removeClass("chart-hidden");
   });
});




