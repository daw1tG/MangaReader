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
	else if (message == 'settings'){
		chrome.storage.session.get(['orientation', 'menu']).then(result => {
			sendResponse(result)
		})
		return true
	}
	else if (message == 'menu closed'){
		chrome.storage.session.set({ menu: false })
		chrome.storage.session.get(["menu"]).then(result =>{
			sendResponse(`menu: ${result}`)
		})
		return true;
	}
	else if (message == 'menu opened'){
		chrome.storage.session.set({ menu: true })
		chrome.storage.session.get(["menu"]).then(result =>{
			sendResponse(`menu: ${result}`)
		})
		return true;
	}
	else if (message == 'menu'){
		chrome.storage.session.get(['menu']).then(result => {
			sendResponse(result.menu)
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
	if (changeInfo.status !== "loading") return;
	console.log("changeinfo: ", changeInfo)
	chrome.storage.session.get(["runMain"]).then(result => {
		if(result.runMain){     
			chrome.storage.session.set({runMain: false}) 
			setTimeout(()=>{
				chrome.scripting.executeScript({
					target: {tabId: tabId},
					files: ['content.js']
				});
			}, 1000)
		} 
	})

});
