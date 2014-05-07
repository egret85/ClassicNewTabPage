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
            var tab_url = tab.url.replace(/https?:\/\/(www\.)?/g, ''),
                topsite_url = _topsites[i].url.replace(/https?:\/\/(www\.)?/g, '');
            if (URI(tab_url).equals(topsite_url))
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


function resizeImage(url, destWidth, destHeight, callback)
{
    var sourceImage = new Image();

    sourceImage.onload = function ()
    {
        var start = new Date().getTime();

        // Create a canvas the size of the original image
        var canvas = document.createElement("canvas");
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;

        // get canvas context draw original image
        var ctx = canvas.getContext("2d");
        ctx.drawImage(sourceImage, 0, 0);

        //determine size for final image
        var finalSize = calculateAspectRatioFill(canvas.width, canvas.height, destWidth, destHeight);

        //resize image by stepping down the size gradually to improve quality
        var scalingSteps = 0;
        var curWidth = canvas.width;
        var curHeight = canvas.height;

        var lastWidth = curWidth;
        var lastHeight = curHeight;

        var end = false;
        var scale = 0.5;
        while (end == false)
        {
            scalingSteps += 1;
            curWidth *= scale;
            curHeight *= scale;

            ctx.drawImage(canvas, 0, 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(curWidth), Math.round(curHeight));
            lastWidth = curWidth;
            lastHeight = curHeight;

            if (curWidth * scale < finalSize.width || curHeight * scale < finalSize.height)
            {
                end = true;
            }
        }

        //extract final image
        var finalCanvas = document.createElement("canvas");
        finalCanvas.width = destWidth;
        finalCanvas.height = destHeight;
        var cropX = Math.round(lastWidth) - destWidth;
        finalCanvas.getContext("2d").drawImage(canvas, Math.round(cropX / 2), 0, Math.round(lastWidth), Math.round(lastHeight), 0, 0, Math.round(lastWidth), Math.round(lastHeight));
        var endTime = new Date().getTime();
        console.log("execution time: " + ( endTime - start) + "ms. scale per frame: " + scale + " scaling step count: " + scalingSteps);

        // Convert the canvas to a data URL in PNG format
        callback(finalCanvas.toDataURL());

    }

    sourceImage.src = url;
}


/**
 * Resize arbitary width x height region to fit inside another region.
 *
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth Source area width
 *
 * @param {Number} srcHeight Source area height
 *
 * @param {Number} destWidth Fittable area available width
 *
 * @param {Number} destWidth Fittable area available height
 *
 * @return {Object} { width, heigth }
 *
 */
function calculateAspectRatioFill(srcWidth, srcHeight, destWidth, destHeight)
{

    var ratio = Math.max(destWidth / srcWidth, destHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
}