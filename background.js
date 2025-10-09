chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		files: ['content.js']
	});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("message received!")

	if (message == 'runMain'){
		chrome.storage.session.set({ runMain: true })
		chrome.storage.session.get(["runMain"]).then(result =>{
			sendResponse(`runMain: ${result}`)
		})
		return;
	}

})


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status !== "complete") return;

	chrome.storage.session.get(["runMain"]).then(result => {
		if(result.runMain){      
			chrome.storage.session.set({ runMain: false })
	
			setTimeout(()=>{
				chrome.scripting.executeScript({
					target: {tabId: tabId},
					files: ['content.js']
				});
			}, 1000)
		} 
	})

});
