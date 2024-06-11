// function extractName() {
//     var headingElement = document.querySelector('h1.text-heading-xlarge');
//     if (headingElement) {
//         console.log("Hello")
//         var name = headingElement.textContent.trim();
//         console.log(name);
//         // Send the name to the background script
//         // chrome.runtime.sendMessage({ action: "extractName", name: name });
//         return name;
//     } else {
//         return "empty";
//     }
//     return "empty";
// }

// function extractCompanyName(){
//     var companyName1 = document.querySelector("#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section.artdeco-card.ySzQpXqkebeCxbOvlmOuLsAiHfBHxzsONc > div.ph5.pb5 > div.mt2.relative > ul > li:nth-child(1) > button > span > div");
//     var companyName2 = document.querySelector("#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section.artdeco-card.ySzQpXqkebeCxbOvlmOuLsAiHfBHxzsONc > div.ph5 > div.mt2.relative > ul > li > button > span > div");
//     if(companyName1 == null && companyName2==null){
//         return "empty";
//     }
//     else
//     {
//         if(companyName1 != null){
//             return companyName1.innerText;
//         }
//         else{

//             return companyName2.innerText;
//         }
//     }
// }



// chrome.commands.onCommand.addListener((command,tab) => {
//     //do stuff here
//     console.log(command + ": has been called");
//     if (command === "increment") {
//         console.log("click is working")
//         console.log("Name:" + extractName());
//         console.log("Company: "+extractCompanyName());
//     //     let cmd = command;
//     //     switch(cmd) {
//     //     case "getHtml":
//     //         sendResponse({title: document.title, url: window.location.href, html: document.documentElement.innerHTML, water:extractName(),heat:extractCompanyName()});
//     //         break;
//     //     case "getHeadTitle":
//     //         sendResponse(document.getElementsByTagName("title")[0].innerHTML);
//     //         break;      
//     //     default:
//     //         sendResponse(null);
//     //     }
//     //     chrome.action.setIcon({ path: "icons/applied.png" }); 
//     }
//    setTimeout(() => {
//         chrome.action.setIcon({ path: "icons/jobs.png" });
//     }, 2000);
// });

console.log("I'm in background.js");
// chrome.commands.onCommand.addListener((command) => {
//     console.log(`${command} has been called`);
    
//     if (command === "increment") {
//         console.log("click is working - in background.js");

//         // Execute content script in the active tab
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             if (tabs.length > 0) {
//                 chrome.scripting.executeScript({
//                     target: { tabId: tabs[0].id },
//                     files: ['content_script.js']
//                 }, () => {
//                     console.log('Content script injected - in background.js');
//                 });
//             }
//         });
//     }
//     setTimeout(() => {
//         chrome.action.setIcon({ path: "icons/jobs.png" });
//     }, 2000);
// });

async function splitFullName(fullName) {
    // Split the full name into an array of words
    const nameParts = fullName.trim().split(/\s+/);
    
    // Get the first name (first element of the array)
    const firstName = nameParts.slice(0,nameParts.length-1).join(' ');
    
    // Get the last name (join the remaining elements of the array)
    const lastName = nameParts[nameParts.length-1];
    if(firstName === ""){
        firstName = lastName;
        lastName = "";
    }
    console.log(firstName, lastName);
    return { firstName, lastName };
}

// Example usage: patGCy3qufjkVYBnM.769a16b3d21775f98901509793612a2a78f32361944908331ebe16ea4b1bd9fc
// apptPOFAJKH4p4gjY
//tbl9rGuWxEVU3Re0y

// Function to push data to Airtable
async function pushDataToAirtable(data,email) {
    const token = ''; // Replace with your Airtable API key
    const baseId = ''; // Replace with your Airtable Base ID
    const tableId = ''; // Replace with your Airtable Table name

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            records: [
                {
                    fields:
                    {
                        Name:data.Name,
                        Company:data.Company,
                        LinkedinURL:data.url,
                        Email:email
                    }
                }
            ]
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Data pushed to Airtable:', result);
    } catch (error) {
        console.error('Error pushing data to Airtable:', error);
    }
}

async function getMailFromApi(data){
    const options = {
        method: 'GET',
        headers: {
          'X-Access-Key': '202542163CyunAo4pPqOmlMAC5g8TLRl4JyyfxFXEH',
          'Content-Type': 'application/json'
        }
      };
      let domain = `${data.Company}`+'.com'
      try {
        const response = await fetch(`https://api.skrapp.io/profile/search/email?companyName=${encodeURIComponent(data.Company)}&size=1`, options);
        const responseData = await response.json();
        
        if (responseData.company && responseData.company.domain) {
            domain = responseData.company.domain;
        } else {
            console.error("Company domain not found in the response.");
        }
        let {firstName,lastName} = await splitFullName(data.Name);
        console.log(firstName,lastName,domain);
        const findResponse = await fetch(`https://api.skrapp.io/api/v2/find?firstName=${firstName}&lastName=${lastName}&domain=${domain}`, options);
        const findData = await findResponse.json();
        let email = "<not found>";
        if(findData.email){
            email = findData.email;
        }
        console.log(findData);
        return email;
    } catch (err) {
        console.error(err);
        return "<not found>";
    }  
} 
// Listener for messages from the popup script
chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {

    if (request.action === 'pushDataToAirtable') {
        let email = await getMailFromApi(request.data);
        pushDataToAirtable(request.data,email);
    }
});
