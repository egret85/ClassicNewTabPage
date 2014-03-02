var DEFAULT_IMG = 'images/alpha.png';
var IS_DEBUG_MODE = true;

function log(logVar) {
    if (IS_DEBUG_MODE) {
        console.log(logVar);
    }
}

function opBg(fnc) {
    var bg = chrome.extension.getBackgroundPage();
    if (bg) {
        fnc(bg);
    }
}