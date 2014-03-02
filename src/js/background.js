var _topsites = [];

chrome.topSites.get(function (mostVisitedURLArr) {
    for (var i = 0; i < mostVisitedURLArr.length; i++) {
        setTopsiteThumb(mostVisitedURLArr[i]);
        _topsites.push(mostVisitedURLArr[i]);
        if (i == 7) break;
    }
});

function setTopsiteThumb(mostVisitedURL) {
    chrome.storage.local.get(mostVisitedURL.url, function (resultObj) {
        if (!resultObj[mostVisitedURL.url]) {
            mostVisitedURL.thumb = DEFAULT_IMG;
        }
        else {
            mostVisitedURL.thumb = resultObj[mostVisitedURL.url];
        }
    });
}


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        for (var i = 0; i < _topsites.length; i++) {
            if (URI(tab.url).equals(_topsites[i].url)) {
                chrome.tabs.captureVisibleTab(tab.windowId, {}, function (dataUrl) {
                    _topsites[i].thumb = dataUrl;
                    var setObj = {};
                    setObj[_topsites[i].url] = dataUrl;
                    chrome.storage.local.set(setObj, function () {
                        log('dataUrl saved');
                    });
                });
                return;
            }
        }
    }
});