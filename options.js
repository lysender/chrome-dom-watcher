onload = function(){

  document.getElementById("submit").onclick = function(){
    var configStr = document.getElementById("config").value;
    var config = null;

    try {
      config = JSON.parse(configStr);
    } catch (err) {
      // Foo
    }
    
    if (config && typeof config === "object") {
      saveConfig(configStr);
    } else {
      alert("Invalid JSON config, check the config and try again.");
    }
  };

  loadConfig()
}

function loadConfig() {
  var config = localStorage.watchedObjects;
  
  if (config && config.length > 0) {
    // Convert config from JSON object to string
    document.getElementById("config").value = config;
  }
}

function saveConfig(config) {
  localStorage.watchedObjects = config;
}
