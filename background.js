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
		return true;
	}
	else if (message == "closed"){
		chrome.storage.session.set({ runMain: false })
		chrome.storage.session.get(["runMain"]).then(result =>{
			sendResponse(`runMain: ${result}`)
		})
		return true;
	}
	else if (message == 'orientation'){
		chrome.storage.session.get(['orientation']).then(result => {
			sendResponse(result.orientation)
		})
		return true
	}
	else {

		chrome.storage.session.set({ orientation: message.manhwa ? "manhwa": "manga"})
		chrome.storage.session.get(['orientation']).then(result => {
			sendResponse('orientation: '+ result.orientation)
		})
		return true
	}
})


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status !== "complete") return;
	console.log("changeinfo: ", changeInfo)
	//if (!/(chapter|series|manga)/i.test(changeInfo.url)) return;
	chrome.storage.session.get(["runMain"]).then(result => {
		if(result.runMain){     
			chrome.storage.session.set({runMain: false}) 
			setTimeout(()=>{
				chrome.scripting.executeScript({
					target: {tabId: tabId},
					files: ['content.js']
				});
			}, 750)
		} 
	})

});
