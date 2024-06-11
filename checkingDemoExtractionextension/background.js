console.log("I'm in background.js");

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

// Example usage:

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
          'X-Access-Key': '',
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
