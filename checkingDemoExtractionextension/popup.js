console.log('In popup.js');

$(function() {
    $('#btn_check').click(function() { 
        
        $("#log").html("");
        checkCurrentTab(); 
    });
});

function checkCurrentTab() {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        if (tabs.length === 0) {
            console.error("No active tabs found");
            log("Error: No active tabs found.");
            return;
        }
        var url = tabs[0].url;
        console.log("checkCurrentTab: "+url);
        $(".pg_url").text(url);

        // request content_script to retrieve title element innerHTML from current tab
        chrome.tabs.sendMessage(tabs[0].id, "getHeadTitle", null, function(obj) {
            console.log("getHeadTitle.from content_script:", obj);
            //log("from content_script:"+obj);
            let details = "Name:"+obj.Name + "\n"+"Company" + obj.Company + "url"+url;
            log(details);
            obj["url"] = url;
            
            chrome.runtime.sendMessage({ action: 'pushDataToAirtable', data: obj });
        });

    });
}
document.addEventListener('DOMContentLoaded', function () {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
            // inject content_script to current tab
            chrome.scripting.executeScript({target: {tabId:activeTabs[0].id, allFrames: false}, 
            files: ['content_script.js']
            });
        });
    });
});

function log(txt) {
    $("#log").html(txt);
}

