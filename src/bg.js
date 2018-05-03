const refreshTabs = []

function refreshAnime(url) {
    chrome.tabs.create({ url: url }, tab => refreshTabs.push(tab.id))
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabIndex = refreshTabs.indexOf(sender.tab.id)
    if (sender.tab && tabIndex >= 0 && request.status === "done") {
        refreshTabs.splice(tabIndex, 1)
        chrome.tabs.remove(sender.tab.id)
    }
})
