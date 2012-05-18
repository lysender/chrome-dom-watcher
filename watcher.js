/** 
 * I don't know this one seriously
 *
 */
 //window.foo = 1;
 //window.bar = 2;
 //window.utag = {"utag_data":'this is utag data',"utag_test":'this is utag test',"utag_deep":{"deep1":'1 km',"deep2":'2 miles'},"others":1}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){

    if (typeof request.config == "object") {
        createDataContainer("chrome-dom-watcher");

        var s = document.createElement("script");
        s.type = "text/javascript";
        s.text = generateScriptCodes(request.config);
        document.body.appendChild(s);

        sendResponse({"result": JSON.parse(getDataContainerValue("chrome-dom-watcher"))});
    } else {
        sendResponse({"result": []});
    }
});

/** 
 * Creates a hidden field that will contain the data
 *
 */
function createDataContainer(id) {
    var e = document.getElementById(id);
    if (!e) {
        i = document.createElement("input");
        i.type = "hidden";
        i.name = id;
        i.id = id;
        document.body.appendChild(i);

        e = document.getElementById(id);
    }

    return e;
}

/** 
 * Sets the data container value
 *
 */
function setDataContainerValue(id, value) {
    var e = document.getElementById(id);

    if (e) {
        e.value = value;
    }
}

/** 
 * Returns the data container value
 *
 */
function getDataContainerValue(id) {
    var e = document.getElementById(id);

    if (e) {
        return e.value;
    }

    return "";
}


function generateScriptCodes(config) {
    var ret = '';
    ret += '    (function(){';
    
    ret += '            var config = ' + JSON.stringify(config) + ';';
    ret += '            var e = document.getElementById("chrome-dom-watcher");';
    
    ret += '            if (e) {';
    ret += '                e.value = JSON.stringify(traverseWatchedObjects(config, window, []));';
    ret += '            }';
    
    ret += '            function traverseWatchedObjects(configObject, targetObject, trail) {';
    
    ret += '                var resultObject = [];';

    ret += '                if (configObject && targetObject && typeof configObject == "object" && typeof targetObject == "object") {';

    ret += '                    for (var k in configObject) {';

    ret += '                        if (k && configObject.hasOwnProperty(k) && targetObject.hasOwnProperty(k)) {';
    ret += '                            var currentTrail = trail.slice();';
    ret += '                            currentTrail.push(k);';

    ret += '                            var configValue = configObject[k];';
    ret += '                            var targetValue = targetObject[k];';

    ret += '                            if (typeof configValue == "object") {';
    ret += '                                deepResult = traverseWatchedObjects(configValue, targetValue, currentTrail);';

    ret += '                                if (typeof deepResult == "object") {';
    ret += '                                    for (var i in deepResult) {';
    ret += '                                        if (deepResult.hasOwnProperty(i)) {';
    ret += '                                            resultObject.push(deepResult[i]);';
    ret += '                                        }';
    ret += '                                    }';
    ret += '                                }';
    ret += '                            } else {';
    ret += '                                var elementValue = "[Object]";';

    ret += '                                if (typeof targetValue !== "object") {';
    ret += '                                    elementValue = targetValue;';
    ret += '                                }';

    ret += '                                resultObject.push([currentTrail, elementValue]);';
    ret += '                            }';
    ret += '                        }';
    ret += '                    }';
    ret += '                }';
    ret += '                return resultObject;';
    ret += '            }';

    ret += '        })();';



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
                var currentTrail = trail.slice();
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

                    if (typeof targetValue !== "object") {
                        elementValue = targetValue;
                    }

                    resultObject.push([currentTrail, elementValue]);
                }
            }
        }
    }
    return resultObject;
}