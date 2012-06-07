onload = function(){

  document.getElementById("submit").onclick = function(){
    saveConfig(document.getElementById("config").value);
  };

  loadConfig()
}

function loadConfig() {
  var config = localStorage.watchedObjects;
  
  if (config && config.length > 0) {
    // Convert config from JSON object to string
    document.getElementById("config").value = config;
  } else {
    // Load dummy config
    document.getElementById("config").value = '{"foo":1,"bar":1}';
  }
}

function saveConfig(config) {
  localStorage.watchedObjects = config;
}
