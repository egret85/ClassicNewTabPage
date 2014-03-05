

$(document).ready(function () {
    var $footer = $('#footer');
    var $recentlyClosedList = $('#recently_closed_list');
    var $menuMostVisited = $footer.find('#menu_mostVisited');
    var $menuApp = $footer.find('#menu_app');
    var $menuRecentlyClosed = $footer.find('#menu_recentlyClosed');
    var $menuWebStore = $footer.find('#menu_webStore');
    var $topSitesList = $('#top_sites_list');

    setI18n();

    setRecentlyClosedDataAndEvent();
    setAppList();
    setTopSites();


    function setRecentlyClosedEvent() {
        $('#menu_recentlyClosed').click(function (event) {
            $recentlyClosedList.toggle();
            return false;
        });
        $(document).click(function (event) {
            if ($recentlyClosedList.is(':visible')) {
                $recentlyClosedList.hide();
            }
        });

    }


    /**
     * http://developer.chrome.com/extensions/override.html#tips
     * The address bar always gets the focus first when the user creates a new tab.
     */


    function setI18n() {
        var getI18nMsg = chrome.i18n.getMessage;
        var mostVisited = getI18nMsg('MSG_mostVisited');
        var app = getI18nMsg('MSG_app');
        var recentlyClosed = getI18nMsg('MSG_recentlyClosed');
        var webStore = getI18nMsg('MSG_webStore');
        $menuMostVisited.attr('title', mostVisited).text(mostVisited);
        $menuApp.attr('title', app).text(app);
        $menuRecentlyClosed.find('#menu_recentlyClosed_txt').text(recentlyClosed);
        $menuWebStore.find('#menu_webStore_txt').text(webStore);
    }


    function setRecentlyClosedDataAndEvent() {
        chrome.history.search(
            {
                text: '',
                maxResults: 20
            },
            function (historyItems) {
                var items = [];
                var templateStr = $('#recently_closed_template').get(0).innerHTML;
                var s = '';
                var validCnt = 0;
                for (var i = 0; i < historyItems.length; i++) {
                    if (!historyItems[i].title) {
                        historyItems[i].title = historyItems[i].url.substr(0, 30);
                    }
                    items.push(historyItems[i]);
                    validCnt++;
                    if (validCnt > 10) {
                        break;
                    }
                }
                log(items);
                log(items.length);
                if (items.length > 0) {
                    for (var i = 0; i < items.length; i++) {
                        // log(items[i]);
                        s += Mustache.to_html(
                            templateStr,
                            {
                                "title": items[i].title,
                                "url": items[i].url,
                                "src": 'chrome://favicon/' + items[i].url
                            }
                        );
                    }

                    $('#recently_closed_list').html(s);
                    setRecentlyClosedEvent();
                }
            }
        );
    }


    function setAppList() {
        chrome.management.getAll(function (data) {
            var appNum = 0;
            var templateStr = $('#app_template').get(0).innerHTML;
            var emptytemplateStr = $('#empty_app_template').get(0).innerHTML;
            var s = '';
            s += Mustache.to_html(
                templateStr,
                {
                    "title": "Chrome Web Store",
                    "id": 'ahfgeienlihckogmohjhadlkjgocpleb',
                    "appLaunchUrl": 'https://chrome.google.com/webstore',
                    "src": 'chrome://extension-icon/ahfgeienlihckogmohjhadlkjgocpleb/128/1'
                }
            );
            appNum++;
            for (var i = 0; i < data.length; i++) {
                /* The launch url (only present for apps).  */
                if (typeof data[i].appLaunchUrl == 'undefined') continue;
                s += Mustache.to_html(
                    templateStr,
                    {
                        "title": data[i].name,
                        "id": data[i].id,
                        "appLaunchUrl": data[i].appLaunchUrl,
                        "src": data[i].icons[data[i].icons.length - 1].url
                    }
                );
                appNum++;
                if (appNum >= 12) {
                    break;
                }
            }
            if (appNum < 12) {
                if (appNum % 4 == 0) {
                //
                }
                else {
                    while (true) {
                        s += Mustache.to_html(emptytemplateStr);
                        appNum++;
                        if (appNum % 4 == 0 || appNum >= 12) {
                            break;
                        }
                    }
                }
            }
            $('#app_list').html(s);
        });
    }

    function setTopSites() {

        function setTopSitesTpl(sites) {
            var num = 0;
            var emptytemplateStr = $('#empty_top_site_template').get(0).innerHTML;
            var templateStr = $('#top_site_template').get(0).innerHTML;
            var s = '';
            for (var i = 0; i < sites.length; i++) {
                s += Mustache.to_html(
                    templateStr,
                    {
                        "title": sites[i].title,
                        "src": sites[i].thumb,
                        "url": sites[i].url
                    }
                );
                num++;
                if (num >= 8) {
                    break;
                }
            }
            if (num < 8) {
                if (num % 4 == 0) {
                    //
                }
                else {
                    while (true) {
                        s += Mustache.to_html(emptytemplateStr);
                        num++;
                        if (num % 4 == 0 || num >= 8) {
                            break;
                        }
                    }
                }
            }
            $topSitesList.html(s);
        }

        function getThumbFromStorageAndSetToDom(mostVisitedURL) {
            chrome.storage.local.get(mostVisitedURL.url, function (resultObj) {
                if (!resultObj[mostVisitedURL.url]) {
                    resultObj[mostVisitedURL.url] = DEFAULT_IMG;
                }
                else {
                    var $a = $topSitesList.find("a[href='" + mostVisitedURL.url + "']");
                    $a.find('img').attr('src', resultObj[mostVisitedURL.url]);
                }
            });
        }

        var background = chrome.extension.getBackgroundPage();

        if (
            !background
                || !background._topsites
                || 0 == background._topsites.length
            ) {
            chrome.topSites.get(function (mostVisitedURLArr) {
                for (var i = 0; i < mostVisitedURLArr.length; i++) {
                    getThumbFromStorageAndSetToDom(mostVisitedURLArr[i]);
                    if (i == 7) break;
                }
                log(mostVisitedURLArr);
                setTopSitesTpl(mostVisitedURLArr);
            });
        }
        else {
            log('background._topsites');
            log(background._topsites);
            setTopSitesTpl(background._topsites);
        }
    }

    function resizerBox() {
        var bl = $(window).width() / 1200;
        var baseW = $('.snapshot').width();
        if ($(window).width() < 1200 && $(window).width() > 750) {
            $('.snapshot').css('width', '19%');
            $('.pagelist').width($('.pagelist').parent().width());
            $('.thumbnail_box').css('height', $('.snapshot').width() - 35);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 1);
            $('.thumbnail_box').css('-webkit-transition', 'all .2s ease-in-out');
            $('.snapshot').css('height', $('.snapshot').width());
            $('.pagelist .snapshot:nth-child(3)').css('marginLeft', 28);
            $('.pagelist .snapshot:nth-child(7)').css('marginLeft', 28);
        } else if ($(window).width() > 1200) {
            $('.snapshot').css('width', 214);
            $('.snapshot').css('height', 165);
            $('.pagelist').width(1000);
            $('.thumbnail_box').css('height', 132);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 1);
            $('.thumbnail_box').css('-webkit-transition', 'all 0 ease-in-out');
            $('.pagelist .snapshot:nth-child(3)').css('marginLeft', 28);
            $('.pagelist .snapshot:nth-child(7)').css('marginLeft', 28);
        } else if ($(window).width() < 750) {
            $('.snapshot').css('width', '19%');
            $('.pagelist').width(300);
            $('.thumbnail_box').css('height', $('.snapshot').width() - 35);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 35);
            $('.thumbnail_box').css('-webkit-transition', 'all .5s ease-in-out');
            $('.snapshot').css('height', $('.snapshot').width());
            $('.pagelist .snapshot:nth-child(3)').css('marginLeft', 0);
            $('.pagelist .snapshot:nth-child(7)').css('marginLeft', 0);

        }
    }

    $('.page_content').width($(window).width());
    $('#BtnRight').click(function () {
        $('.gbox').css({
            '-webkit-transform': 'translate3d(' + (-document.documentElement.clientWidth) + 'px, 0, 0)',
            '-webkit-transition': 'all .2s ease-in-out'
        });
        $('#BtnLeft').show();
        $('#BtnRight').hide();
        $('#clist li').removeClass('current');
        $('#clist li').eq(1).addClass('current');
        resizerBox();
        var setObj = {};
        setObj["currentView"] = "Apps";
        chrome.storage.local.set(setObj);
    });
    $('#BtnLeft').click(function () {
        $('.gbox').css({
            '-webkit-transform': 'translate3d(' + (0) + 'px, 0, 0)',
            '-webkit-transition': 'all .2s ease-in-out'
        });
        $('#BtnRight').show();
        $('#BtnLeft').hide();
        $('#clist li').removeClass('current');
        $('#clist li').eq(0).addClass('current');
        resizerBox();
        var setObj = {};
        setObj["currentView"] = "MostVisited";
        chrome.storage.local.set(setObj);
    });

    $('#clist li').click(function () {
        $('#clist li').removeClass('current');
        $(this).addClass('current');
    });
    $('#clist li').eq(0).click(function () {
        $('#BtnLeft').click();
    });
    $('#clist li').eq(1).click(function () {
        $('#BtnRight').click();
    });
    $(window).load(function () {
        chrome.storage.local.get("currentView", function (resultObj) {

            if(resultObj["currentView"] == "Apps")
            {
                $('#BtnRight').click();
            }
            else
            {
                $('#BtnLeft').click();
            }

            setTimeout(function () {
                $("body").show();
            }, 200);
        });
    });

    $(window).resize(function () {
        $('.page_content').width($(window).width());
        if ($('.gbox').css('-webkit-transform') != 'matrix(1, 0, 0, 1, 0, 0)') {
            $('.gbox').css({
                '-webkit-transform': 'translate3d(' + (-document.documentElement.clientWidth) + 'px, 0, 0)',
                '-webkit-transition': 'all 0s ease-in-out'
            });
        } else {
            $('.gbox').css({
                '-webkit-transform': 'translate3d(0px, 0, 0)',
                '-webkit-transition': 'all 0s ease-in-out'
            })
        }
        resizerBox();
    });
});




