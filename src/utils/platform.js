export default class Platform {

    static isNativeDesktop() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("electron") > 0 && userAgent.indexOf("pulse-sms") > 0;
    }

    static isChromeExtension() {
        return window.chrome && chrome && chrome.runtime && chrome.runtime.id !== undefined;
    }

    static isChromeApp() {
        return navigator.userAgent.toLowerCase().indexOf("chrome-app") > 0;
    }

    static isWebsite() {
        return !Platform.isChromeExtension() && !Platform.isChromeApp() && !Platform.isNativeDesktop();
    }

    static getPlatformIdentifier() {
        if (Platform.isChromeExtension()) {
            return 1;
        } else if (Platform.isChromeApp()) {
            return 2;
        } else if (Platform.isNativeDesktop()) {
            return 3;
        } else {
            return 0; // fallback to just the web browser
        }
    }

}
