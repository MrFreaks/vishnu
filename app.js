var inputValue = document.querySelector('.inputValue');
var name = document.querySelector('.name');
var temp = document.querySelector('.temp');
var desc = document.querySelector('.desc');
var button= document.querySelector('.button');


button.addEventListener('click', function(){
fetch('https://api.openweathermap.org/data/2.5/weather?q='+ inputValue.value+'&appid=de3d363b31ea14671873e3056439930d')
.then(response => response.json())
.then(data =>  {
  var tempValue = data['main']['temp'];
  var nameValue = data['name'];
  var descValue = data['weather'][0]['description'];

  name.innerHTML = nameValue;
  desc.innerHTML = "Climatic Condition - "+descValue;
  temp.innerHTML = "Temperature - "+(tempValue - 273.15)+ "℃";
  input.value ="";

})

.catch(err => alert("press ok"));
})