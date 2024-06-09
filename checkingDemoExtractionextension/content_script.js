// you will see this log in console log of current tab in Chrome when the script is injected
chrome.runtime.onMessage.addListener(function(cmd, sender, sendResponse) {
    console.log("chrome.runtime.onMessage: "+cmd);
    console.log("Name:" + extractName());
    console.log("Company: "+extractCompanyName());
    switch(cmd) {
    case "getHtml":
        sendResponse({title: document.title, url: window.location.href, html: document.documentElement.innerHTML, water:extractName(),heat:extractCompanyName()});
        break;
    case "getHeadTitle":
        //document.getElementsByTagName("title")[0].innerHTML
        sendResponse({"Name":extractName(),"Company":extractCompanyName()});
        break;      
    default:
        sendResponse(null);
    }
});

function extractName() {
    var headingElement = document.querySelector('h1.text-heading-xlarge');
    if (headingElement) {
        console.log("Hello")
        var name = headingElement.textContent.trim();
        console.log(name);
        // Send the name to the background script
        //chrome.runtime.sendMessage({ action: "extractName", name: name });
        return name;
    } else {
        return "empty";
    }
    return "empty";
}

function extractCompanyName(){
    var companyName1 = document.querySelector("#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section.artdeco-card.ySzQpXqkebeCxbOvlmOuLsAiHfBHxzsONc > div.ph5.pb5 > div.mt2.relative > ul > li:nth-child(1) > button > span > div");
    var companyName2 = document.querySelector("#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section.artdeco-card.ySzQpXqkebeCxbOvlmOuLsAiHfBHxzsONc > div.ph5 > div.mt2.relative > ul > li > button > span > div");
    if(companyName1 == null && companyName2==null){
        return "empty";
    }
    else
    {
        if(companyName1 != null){
            return companyName1.innerText;
        }
        else{

            return companyName2.innerText;
        }
    }
}