chrome.tabs.getSelected(null, function(tab) {
    var config = localStorage.watchedObjects;
    var valid = false;

    // Convert to JSON
    try {
        config = JSON.parse(config);
        valid = true;
    } catch (err) {
        console.log("Error converting config string to JSON.");
    }

    if (valid && config) {
        chrome.tabs.sendRequest(tab.id, {"config": config}, function(response) {
            loadWatchedObjects(response.result);
        });
    }
});


function loadWatchedObjects(result) {

    if (result && result.length > 0) {
        var s = "<table class='table table-bordered table-striped table-condensed'><tbody>";

        for (var k in result) {
            if (result.hasOwnProperty(k) && result[k] && typeof result[k] == "object") {
                s += "<tr>";
                s += "<td>" + result[k][0].join(".") + " &nbsp;</td>";
                s += "<td>" + result[k][1] + " &nbsp;</td>";
                s += "</tr>";
            }
        }

        s += "</tbody></table>";

        if (s.length) {
            document.getElementById("watched-objects").innerHTML = s;
        }
    } else {
        document.getElementById("watched-objects").innerHTML = "<p>None of the watched objects are found.</p>";
    }
}

function inspectWatchedObjects(config) {
    var ret = traverseWatchedObjects(config, window, []);

    return ret;
}

/** 
 * Traverses recursively the config and target object so that deep traversal is
 * possible and can be dynamic as much as possible
 *
 * @param Object configObject
 * @param Object targetObject
 * @param String trail
 * @returns Object
 */
function traverseWatchedObjects(configObject, targetObject, trail) {

    var resultObject = [];

    // All must be objects to be able to pass here
    if (configObject && targetObject && typeof configObject == "object" && typeof targetObject == "object") {

        for (var k in configObject) {
            // The config key must also exist in target object's elements
            if (k && configObject.hasOwnProperty(k) && targetObject.hasOwnProperty(k)) {
                var currentTrail = trail;
                currentTrail.push(k);

                var configValue = configObject[k];
                var targetValue = targetObject[k];

                // Should not be an object, we'll not traverse anymore
                if (typeof configValue == "object") {
                    // Traverse again
                    deepResult = traverseWatchedObjects(configValue, targetValue, currentTrail);

                    if (typeof deepResult == "object") {
                        for (var i in deepResult) {
                            if (deepResult.hasOwnProperty(i)) {
                                resultObject.push(deepResult[i]);
                            }
                        }
                    }
                } else {
                    // Traversal ends here, return
                    var elementValue = "[Object]";

                    if (typeof targetObject !== "object") {
                        elementValue = targetValue;
                    }

                    resultObject.push([currentTrail, elementValue]);
                }
            }
        }
    }

    return resultObject;
}