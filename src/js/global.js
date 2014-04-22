$(document).ready(function () {
    var $footer = $('#footer');
    var $recentlyClosedList = $('#recently_closed_list');
    var $otherDevicesList = $('#other_devices_list');
    var $menuMostVisited = $footer.find('#menu_mostVisited');
    var $menuApp = $footer.find('#menu_app');
    var $menuRecentlyClosed = $footer.find('#menu_recentlyClosed');
    var $menuOtherDevices = $footer.find('#menu_otherDevices');
    var $menuWebStore = $footer.find('#menu_webStore');
    var $topSitesList = $('#top_sites_list');

    setI18n();

    setRecentlyClosedEvent();
    setAppList();
    setTopSites();

    // NOTE - VEH 2014/04/02: uses chrome.sessions API (only available in dev build (35.0.1916.6 dev-m) as of now)
    // disable the other devices button if chrome.sessions is not available
    if (!chrome.sessions) {
        disableOtherDevices();
    } else {
        setOtherDevicesEvent();
    }

    // Hide menus when clicking elements that have the class "onclick-hides-menu"
    function hideMenus() {
        if ($otherDevicesList.is(':visible')) {
            $otherDevicesList.hide();
        }
        if ($recentlyClosedList.is(':visible')) {
            $recentlyClosedList.hide();
        }
        $('#otherdevices-context-menu').hide();
    }
    $(".onclick-hides-menu").click(hideMenus);

    function setRecentlyClosedEvent() {
        $('#menu_recentlyClosed').click(function (event) {
            if (!$recentlyClosedList.is(':visible')) {
                // (re)load data if not visible
                setRecentlyClosedData();
                // hide all (other) menus
                hideMenus();
                // open menu
                $recentlyClosedList.toggle();
            } else {
                hideMenus();
            }

            // we must return false here or the hideMenus() function will be called again by the ".onclick-hides-menu" click handler
            // returning false here stops event propagation (the click event of all parent elements is not triggered)
            return false;
        });
    }

    function setOtherDevicesEvent() {
        $('#menu_otherDevices').click(function (event) {
            if (!$otherDevicesList.is(':visible')) {
                // (re)load data if not visible
                setOtherDevicesData();
                // hide all (other) menus
                hideMenus();
                // open menu
                $otherDevicesList.toggle();
            } else {
                hideMenus();
            }

            // we must return false here or the hideMenus() function will be called again by the ".onclick-hides-menu" click handler
            // returning false here stops event propagation (the click event of all parent elements is not triggered)
            return false;
        });
        $('#other_devices_list').click(function (event) {
            $('.otherdevices-context-menu').hide();
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
        var otherDevices = getI18nMsg('MSG_otherDevices');
        var webStore = getI18nMsg('MSG_webStore');
        $menuMostVisited.attr('title', mostVisited).text(mostVisited);
        $menuApp.attr('title', app).text(app);
        $menuRecentlyClosed.find('#menu_recentlyClosed_txt').text(recentlyClosed);
        $menuOtherDevices.find('#menu_otherDevices_txt').text(otherDevices);
        $menuWebStore.find('#menu_webStore_txt').text(webStore);
    }


    function setRecentlyClosedData() {
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
                }
            }
        );
    }


    function setOtherDevicesData() {
        // NOTE - VEH 2014/04/02: uses chrome.sessions API (only available in dev build (35.0.1916.6 dev-m) as of now)
        chrome.sessions.getDevices(
            {
                maxResults: 20
            },
            function (devices) {
                var templateStr = $('#other_devices_template').get(0).innerHTML;
                var s = '';
                var validCnt = 0;

                log(devices);
                // loop trough devices
                for (var i = 0; i < devices.length; i++) {
                    var tabs = [];

                    // if there are no sessions for this device, do nothing and continue to the next one
                    if (devices[i].sessions.length <= 0)
                        continue;

                    // Add device title
                    // sessions are sorted with the most recent first
                    // TODO - VEH 2014/04/02: make each device's list collapsible like it was in the good old days
                    s += '<h3 id="h3-od-' + devices[i].info + '">' + devices[i].info + ' <button tabindex="-1" class="btn-menu drop-down" id="btn-dd-od-' + devices[i].info + '"></button>' + "\n" +
                        '<menu class="otherdevices-context-menu" id="menu-od-' + devices[i].info + '" style="display: none">' + "\n" +
                        '    <button id="btn-cl-od-' + devices[i].info + '">Collapse list</button>' + "\n" +
                        '    <button id="btn-el-od-' + devices[i].info + '" style="display: none">Expand list</button>' + "\n" +
                        '    <button id="btn-oa-od-' + devices[i].info + '">Open all</button>' + "\n" +
                        '</menu>' + "\n" +
                        '<span class="details">' + $.timeago(new Date(devices[i].sessions[0].lastModified*1000)) + '</span></h3>' + "\n" +
                         '<section id="otherdevice-' + devices[i].info + '">';

                    // loop trough sessions and add tabs to the local tabs array
                    for (var j = 0; j < devices[i].sessions.length; j++) {
                        if (devices[i].sessions[j].tab) {
                            tabs.push(devices[i].sessions[j].tab);
                        }
                        if (devices[i].sessions[j].window) {
                            for (var k = 0; k < devices[i].sessions[j].window.tabs.length; k++) {
                                tabs.push(devices[i].sessions[j].window.tabs[k]);
                            }
                        }
                    }

                    log(tabs);
                    log(tabs.length);
                    // loop trough the local tabs array and add each entry to the list
                    if (tabs.length > 0) {
                        for (var j = 0; j < tabs.length; j++) {
                            s += Mustache.to_html(
                                templateStr,
                                {
                                    "title": ( tabs[j].title ? tabs[j].title : tabs[j].url ),
                                    "url": tabs[j].url,
                                    "src": 'chrome://favicon/' + tabs[j].url
                                }
                            );
                        }
                    }

                    s += '</section>';
                }

                $('#other_devices_list').html(s);

                // set actions for context menu
                // use closure function scopes to hold on to the correct value of devices[i].info when the event is triggered
                for (var i = 0; i < devices.length; i++) {
                    $('#h3-od-' + devices[i].info).on('contextmenu', 
                        (function (deviceinfo) {
                            return function (event) {
                                toggle_otherdevices_contextmenu(deviceinfo);
                                return false;    // return false to prevent normal context menu from showing
                            };
                        })(devices[i].info)
                    );
                    $('#btn-dd-od-' + devices[i].info).click(
                        (function (deviceinfo) { 
                            return function (event) {
                                toggle_otherdevices_contextmenu(deviceinfo);
                                return false;    // return false to prevent $('#other_devices_list').click from triggering, which would hide the context menu regardless
                            };
                        })(devices[i].info)
                    );
                    $('#btn-cl-od-' + devices[i].info).click(
                        (function (deviceinfo) { 
                            return function (event) {
                                collapse_otherdevices_content(deviceinfo);
                            };
                        })(devices[i].info)
                    );
                    $('#btn-el-od-' + devices[i].info).click(
                        (function (deviceinfo) { 
                            return function (event) {
                                expand_otherdevices_content(deviceinfo);
                            };
                        })(devices[i].info)
                    );
                    $('#btn-oa-od-' + devices[i].info).click(
                        (function (deviceinfo) { 
                            return function (event) {
                                openall_otherdevices_content(deviceinfo);
                            };
                        })(devices[i].info)
                    );
                }
            }
        );
    }

    function disableOtherDevices() {
        $menuOtherDevices.hide();
        $otherDevicesList.hide();
    }

    function enableOtherDevices() {
        $menuOtherDevices.show();
    }

    function toggle_otherdevices_contextmenu(deviceinfo) {
        $('#menu-od-' + deviceinfo).toggle();
    }

    function collapse_otherdevices_content(deviceinfo) {
        $('#otherdevice-' + deviceinfo).hide();
        $('#btn-cl-od-' + deviceinfo).hide();
        $('#btn-el-od-' + deviceinfo).show();
    }

    function expand_otherdevices_content(deviceinfo) {
        $('#otherdevice-' + deviceinfo).show();
        $('#btn-cl-od-' + deviceinfo).show();
        $('#btn-el-od-' + deviceinfo).hide();
    }

    function openall_otherdevices_content(deviceinfo) {
        $('#otherdevice-' + deviceinfo + ' a').each(function (index) {
            chrome.tabs.create({ url: $( this ).attr('href') });
        });
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
        var snapshotRatio = 0.80;
        var thumbRatio = 0.62;
        if ($(window).width() < 1200 && $(window).width() > 750) {
            $('.snapshot').css('width', '19%');
            $('.app-snapshot').css('width', '19%');
            $('.pagelist').width($('.pagelist').parent().width());
            $('.thumbnail_box').css('height', ($('.snapshot').width() - 1) * thumbRatio);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 1);
            $('.thumbnail_box').css('-webkit-transition', 'all .2s ease-in-out');
            $('.app_thumbnail_box').css('height', $('.app-snapshot').width() - 35);
            $('.app_thumbnail_box').css('width', $('.app-snapshot').width() - 35);
            $('.app_thumbnail_box').css('-webkit-transition', 'all .2s ease-in-out');
            $('.snapshot').css('height', $('.snapshot').width() * snapshotRatio);
            $('.app-snapshot').css('height', $('.app-snapshot').width());
            $('.pagelist .snapshot:nth-child(3)').css('marginLeft', 28);
            $('.pagelist .snapshot:nth-child(7)').css('marginLeft', 28);
        } else if ($(window).width() > 1200) {
            $('.snapshot').css('width', 214);
            $('.snapshot').css('height', $('.snapshot').width() * snapshotRatio);
            $('.app-snapshot').css('width', 214);
            $('.app-snapshot').css('height', 165);
            $('.pagelist').width(1000);
            $('.thumbnail_box').css('height', ($('.snapshot').width() - 1) * thumbRatio);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 1);
            $('.thumbnail_box').css('-webkit-transition', 'all 0 ease-in-out');
            $('.app_thumbnail_box').css('height', 132);
            $('.app_thumbnail_box').css('width', $('.app-snapshot').width() - 1);
            $('.app_thumbnail_box').css('-webkit-transition', 'all 0 ease-in-out');
            $('.pagelist .snapshot:nth-child(3)').css('marginLeft', 28);
            $('.pagelist .snapshot:nth-child(7)').css('marginLeft', 28);
        } else if ($(window).width() < 750) {
            $('.snapshot').css('width', '19%');
            $('.app-snapshot').css('width', '19%');
            $('.pagelist').width(300);
            $('.thumbnail_box').css('height', ($('.snapshot').width() - 1) * thumbRatio);
            $('.thumbnail_box').css('width', $('.snapshot').width() - 1);
            $('.thumbnail_box').css('-webkit-transition', 'all .5s ease-in-out');
            $('.snapshot').css('height', $('.snapshot').width() * snapshotRatio);
            $('.app_thumbnail_box').css('height', $('.app-snapshot').width() - 35);
            $('.app_thumbnail_box').css('width', $('.app-snapshot').width() - 35);
            $('.app_thumbnail_box').css('-webkit-transition', 'all .5s ease-in-out');
            $('.app-snapshot').css('height', $('.app-snapshot').width());
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
                $(window).resize();
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

    // load appropriate locale for the timeago plugin (will probably default to english if this is not found)
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'js/timeago/locales/jquery.timeago.' + chrome.i18n.getUILanguage() + '.js';
    head.appendChild(script);
});