var cssHeight = $(window).height();
var cssWidth = $(window).width();
console.log(cssHeight, cssWidth);
if (400<cssWidth&&cssWidth<990){
  $('#selectMain2').css('width', '90%');
}else if (cssWidth<=400){
  $('#selectMain2').css('width', '90%');
  $('#floatingPanel').css('top','0');
}

var map;
var markers = {};
var position = [];
var a=-1;
var infoWindow =[];




function initMap() {
  //Draw Map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 19,
    center: {
      lat: 25.0336377,
      lng: 121.5645727
    }
  });
  //Draw Map

  //DrawMarker
  for (var i = 0; i < position.length; i++) {
    addMarker(i);
  }
  //DrawMarker

  //增加搜尋條件
  var geocoder = new google.maps.Geocoder();
  document.getElementById('ShowMap').addEventListener('click', function () {
    geocodeAddress(geocoder, map);
  });
  console.log(geocoder);
  //增加搜尋條件 

}

//增加搜尋部分
function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('Starting').value;
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var icon ={
        url: "./map.png",
        scaledSize: new google.maps.Size(50, 50), 
      }
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
        icon: icon,
        animation: google.maps.Animation.DROP
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
//增加搜尋部分





let vm = new Vue({
  el: "#app",
  data: {
    Store:'餐廳',
    Starting:'台北車站',
    FinalDestination:0,
    WantDestinationData:[
      ],
    UserTravelMode:[
      { value: 0, text: 'DRIVING' },
      { value: 1, text: 'WALKING' }],
    FinalMode:0,
    AllData:[],
    Case2Result:[],
    Case3Result: [],
    Style:'請選擇排序方式',
    OriLocation:{},
    selected: 0,
    options: [
      {value: 1, text: 'None'  },
      {value: 2, text: 'Rating(High to Low)'}, 
      {value: 3, text: 'Rating Counts(High to Low)'},
      {value: 4, text: 'Distance(Far to Near)'}]
  },
  computed:{
    ShowResult(){
      $('.ItemText1').css('color', 'black');
      $('.ItemText2').css('color', 'black');
      $('.ItemText3').css('color', 'black');
      $('.ItemText3').css('text-shadow', '0px 0px 0px #FFFFFF');
      $('.ItemText2').css('text-shadow', '0px 0px 0px #FFFFFF');
      $('.ItemText1').css('text-shadow', '0px 0px 0px #FFFFFF');
      switch (this.selected){
        case 1:
          //None
        return this.AllData
        case 2:
          //好感度
          $('.ItemText1').css('color','red');
          $('.ItemText1').css('text-shadow', '0px 0px 15px #FF37FD');
          this.Case2Result = this.AllData.sort(function (a, b) {
            return b.PointRating - a.PointRating;
        });
          return this.Case2Result
        case 3:
          //好感評論數
          $('.ItemText2').css('color', 'red');
          $('.ItemText2').css('text-shadow', '0px 0px 15px #FF37FD');
          this.Case3Result = this.AllData.sort(function (a, b) {
            return b.PointRatingCounts - a.PointRatingCounts;
          });
          return this.Case3Result
        case 4:
          //距離
          $('.ItemText3').css('color', 'red');
          $('.ItemText3').css('text-shadow', '0px 0px 15px #FF37FD');
          this.Case4Result = this.AllData.sort(function (a, b) {
            return a.PointDistance - b.PointDistance;
          });
          return this.Case4Result          
      }
    },
    WantDestination(){
      return this.WantDestinationData;
    },
    TravelMode(){
      return this.UserTravelMode;
    }
  },
  methods:{
    GetValue(){
      const APIKey = '&key=AIzaSyAKPRtjCaWwtsRtJLlQWDC4c9UapdhJu1o';
      const AnsCORS = 'https://cors-anywhere.herokuapp.com/'
      const PlaceAPI = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
      
      let url = AnsCORS+PlaceAPI + '?query=' + this.Store + '+in+' + this.Starting + APIKey;
      let url2 = AnsCORS+PlaceAPI + '?query=' + this.Starting + APIKey;
      axios.get(url2).then((res)=>{
        this.OriLocation = res.data.results[0].geometry.location
        //console.log(this.OriLocation);
      })
      axios.get(url).then((res) => {
        this.contents = res.data.results
        //console.log(this.contents);
      for (let i = 0; i < this.contents.length;i++){
        let Point1 = {
          lat: this.OriLocation.lat,
          lng: this.OriLocation.lng
        }
        let Point2 = {
          lat: this.contents[i].geometry.location.lat,
          lng: this.contents[i].geometry.location.lng
        }

        let PointDistance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(Point1),
          new google.maps.LatLng(Point2)
        )
        PointDistance = PointDistance.toFixed(2)
        //console.log(PointDistance);
        PointAddress = this.contents[i].formatted_address;
        PointLat = this.contents[i].geometry.location.lat;
        PointLng = this.contents[i].geometry.location.lng;
        PointName= this.contents[i].name;
        PointRating = this.contents[i].rating;
        PointRatingCounts=this.contents[i].user_ratings_total;
          this.AllData[i] = {
            PointAddress: PointAddress,
            PointLat: PointLat,
            PointLng: PointLng,
            PointName: PointName,
            //PointOpeningTime: PointOpeningTime,
            PointRating: PointRating,
            PointRatingCounts: PointRatingCounts,
            PointDistance: PointDistance
          }
      }
      })
      console.log(this.AllData);
      return this.AllData
    }, 
    addMarker(){
      for (let i = 0; i < this.AllData.length; i++) {
          markers = new google.maps.Marker({
          position: {
            lat: this.AllData[i].PointLat,
            lng: this.AllData[i].PointLng
          },
          map: map,
          animation: google.maps.Animation.DROP,
          });
        this.WantDestinationData[i] = { value: i, text: this.AllData[i].PointName };
        attachSecretMessage(markers, this.AllData[i].PointName);
      }
      function attachSecretMessage(markers, secretMessage) {
        var infoWindow = new google.maps.InfoWindow({
          content: secretMessage
        });
        markers.addListener('click', function () {
          infoWindow.open(markers.get('map'), markers); 
        });
      }  
    },
    Destination(){
      var markerArray = [];
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer({ map: map });
      var stepDisplay = new google.maps.InfoWindow;
      calculateAndDisplayRoute(
        directionsDisplay, directionsService, markerArray, stepDisplay, map, this.FinalMode);
      // Listen to change events from the start and end lists.
      var onChangeHandler = function () {
        calculateAndDisplayRoute(
          directionsDisplay, directionsService, markerArray, stepDisplay, map, TravelMode);
      };
      document.getElementById('Starting').addEventListener('change', onChangeHandler);
      document.getElementById('FinalDestination').addEventListener('change', onChangeHandler);


      function calculateAndDisplayRoute(directionsDisplay, directionsService,
        markerArray, stepDisplay, map, FinalMode) {
        // First, remove any existing markers from the map.
        for (var i = 0; i < markerArray.length; i++) {
          markerArray[i].setMap(null);
        }
        // Retrieve the start and end locations and create a DirectionsRequest using
        // WALKING directions.
        directionsService.route({
          origin: document.getElementById('Starting').value,
          destination: document.getElementById('FinalDestination').value,
          travelMode: FinalMode
        }, function (response, status) {
          // Route the directions and pass the response to a function to create
          // markers for each step.
          if (status === 'OK') {
            document.getElementById('warnings-panel').innerHTML =
              '<b>' + response.routes[0].warnings + '</b>';
            directionsDisplay.setDirections(response);
            showSteps(response, markerArray, stepDisplay, map);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }
      function showSteps(directionResult, markerArray, stepDisplay, map) {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.
        var myRoute = directionResult.routes[0].legs[0];
        for (var i = 0; i < myRoute.steps.length; i++) {
          var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
          marker.setMap(map);
          marker.setPosition(myRoute.steps[i].start_location);
          attachInstructionText(
            stepDisplay, marker, myRoute.steps[i].instructions, map);
        }
      }
      function attachInstructionText(stepDisplay, marker, text, map) {
        google.maps.event.addListener(marker, 'click', function () {
          // Open an info window when the marker is clicked on, containing the text
          // of the step.
          stepDisplay.setContent(text);
          stepDisplay.open(map, marker);
        });
      }
    },
    StepFunction(){
      //this.GetValue()
      
      // setTimeout(function(){
      //   vm.addMarker();
      // },3000)
      
    }
  }
})
