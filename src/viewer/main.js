"use strict";

/*global require,$*/

var start = true;

var PopupMessage = require('./PopupMessage');
var FeatureDetection = require('../../third_party/cesium/Source/Core/FeatureDetection');

// If we're not in a normal browser environment (Web Worker maybe?), do nothing.
if (typeof window === 'undefined') {
    start = false;
} else {
    if (FeatureDetection.isInternetExplorer() && FeatureDetection.internetExplorerVersion()[0] < 9) {
        var oldBrowserMessage = new PopupMessage({
            container : document.body,
            title : 'Internet Explorer 8 or earlier detected',
            message : '\
    National Map requires Internet Explorer 9 or later.  For the best experience, we recommend \
    <a href="http://www.microsoft.com/ie" target="_blank">Internet Explorer 11</a> or the latest version of \
    <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a> or \
    <a href="http://www.mozilla.org/firefox" target="_blank">Mozilla Firefox</a>.'
        });

        start = false;
    }
}

if (start) {
    // IE9 doesn't have a console object until the debugging tools are opened.
    if (typeof window.console === 'undefined') {
        window.console = {
            log : function() {}
        };
    }

    window.CESIUM_BASE_URL = 'build/Cesium/';

    var copyright = require('../CopyrightModule');

    var SvgPathBindingHandler = require('../../third_party/cesium/Source/Widgets/SvgPathBindingHandler');
    var knockout = require('../../third_party/cesium/Source/ThirdParty/knockout');
    var loadImage = require('../../third_party/cesium/Source/Core/loadImage');
    var loadWithXhr = require('../../third_party/cesium/Source/Core/loadWithXhr');

    var AusGlobeViewer = require('./AusGlobeViewer');
    var corsProxy = require('../corsProxy');
    var GeoDataCollection = require('../GeoDataCollection');
    var registerGeoDataViewModels = require('../ViewModels/registerGeoDataViewModels');

    SvgPathBindingHandler.register(knockout);
    registerGeoDataViewModels();

    // Intercept XHR requests and proxy them if necessary.
    loadWithXhr.load = function(url, responseType, method, data, headers, deferred, overrideMimeType) {
        if (corsProxy.shouldUseProxy(url)) {
            url = corsProxy.getURL(url);
        }
        return loadWithXhr.defaultLoad(url, responseType, method, data, headers, deferred, overrideMimeType);
    };

    // Intercept image requests and proxy them if necessary.
    loadImage.createImage = function(url, crossOrigin, deferred) {
        if (crossOrigin && corsProxy.shouldUseProxy(url)) {
            url = corsProxy.getURL(url);
        }
        return loadImage.defaultCreateImage(url, crossOrigin, deferred);
    };

    var geoDataManager = new GeoDataCollection();

    var viewer = new AusGlobeViewer(geoDataManager);
}
