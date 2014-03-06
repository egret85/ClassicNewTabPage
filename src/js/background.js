var _topsites = [];

chrome.topSites.get(function (mostVisitedURLArr)
{
    for (var i = 0; i < mostVisitedURLArr.length; i++)
    {
        setTopsiteThumb(mostVisitedURLArr[i]);
        _topsites.push(mostVisitedURLArr[i]);
        if (i == 7)
        {
            break;
        }
    }
});

function setTopsiteThumb(mostVisitedURL)
{
    chrome.storage.local.get(mostVisitedURL.url, function (resultObj)
    {
        if (!resultObj[mostVisitedURL.url])
        {
            mostVisitedURL.thumb = DEFAULT_IMG;
        }
        else
        {
            mostVisitedURL.thumb = resultObj[mostVisitedURL.url];
        }
    });
}


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    if (changeInfo.status === 'complete')
    {
        for (var i = 0; i < _topsites.length; i++)
        {
            if (URI(tab.url).equals(_topsites[i].url))
            {
                chrome.tabs.captureVisibleTab(tab.windowId, {"format": "png"}, function (dataUrl)
                {
                    chrome.tabs.query({windowId: tab.windowId, active: true}, function (tabArr)
                    {
                        for (var j = 0; j < tabArr.length; j++)
                        {
                            if (tabId == tabArr[j].id)
                            {
                                resizeImage(dataUrl, 211, 130, function (resizedDataUrl)
                                {
                                    _topsites[i].thumb = resizedDataUrl;
                                    var setObj = {};
                                    setObj[_topsites[i].url] = resizedDataUrl;
                                    chrome.storage.local.set(setObj, function ()
                                    {
                                        log('dataUrl saved');
                                    });
                                });
                            }
                        }
                    });
                });
                return;
            }
        }
    }
});


function resizeImage(url, width, height, callback)
{
    var sourceImage = new Image();

    sourceImage.onload = function ()
    {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL());
    }

    sourceImage.src = url;
}