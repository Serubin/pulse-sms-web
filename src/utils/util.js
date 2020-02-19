import jump from 'jump.js';
import firebase from 'firebase/app';
import 'firebase/storage';
import store from '@/store/';

export default class Util {
    /**
     * Expand color to full RGBA string
     *
     * @param raw rgba value
     * @return RGBA string
     */
    static expandColor (num) {
        num >>>= 0;

        let b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16,
            a = ((num & 0xFF000000) >>> 24) / 255;
        return "rgba(" + [r, g, b, a].join(",") + ")";
    }

    static entityEncode (string) {
        while (string.indexOf("<") !== -1) {
            string = string.replace("<", "&lt;");
        }

        while (string.indexOf(">") !== -1) {
            string = string.replace(">", "&gt;");
        }

        string = string.replace(/\n/g, '<br />');

        return string;
    }

    static generateSnippet (object) {

        if(typeof object.snippet != "undefined")
            return object.snippet;

        let snippet = object.snippet || object.dataNoEmoji || object.data;
        let type = object.message_type || object.type;
        let mime_type = object.mime_type || "text/plain";


        snippet = mime_type == "text/plain" ? (snippet) : "<i>Picture Message</i>";

        if (type != 0 && type != 6 && type != 3 && type != 5)
            snippet = "You: " + snippet;

        return snippet;

    }

    static generateContact (id, name, phone_number, mute, private_notifications, color, accent, ligher, darker) {
        return {
            id: id,
            name: name,
            phone_number: phone_number,
            mute: mute,
            private_notifications: private_notifications,
            colors: {
                default: color,
                accent: accent,
                ligher: ligher,
                darker: darker
            }
        };
    }

    static createIdMatcher(phone) {
        let stripped = phone.replace(/\+/g, "").replace(/ /g, "")
            .replace(/-/g, "").replace(/\./g, "")
            .replace(/\(/g, "").replace(/\)/g, "")
            .replace(/,/g, "");

        if (stripped.length > 8)
            return stripped.substring(stripped.length - 8, stripped.length);
        else
            return stripped;
    }

    /**
        * Scroll to bottom
        * Scrolls thread to bottom of page; uses tween easing
        *
        * @param speed - default to zero (no animation)
        */
    static scrollToBottom(speed=0) {

        if (Util.isScrolledToBottom()) // Ignore if at bottom
            return false;

        const docu = document.getElementsByTagName("html")[0].clientHeight;
        const body = document.getElementsByTagName("body")[0].clientHeight;

        const bottom = Math.max(docu, body); // Calculate bottom

        // Jump to bottom
        jump(bottom, {
            duration: speed,
            easing: (t, b, c, d) => { // easeInOutCubic - @jaxgeller
                if ((t/=d/2) < 1) return c/2*t*t*t + b;
                return c/2*((t-=2)*t*t + 2) + b;
            }
        });
    }

    /**
     * Is Scrolled to Bottom
     * Determines if scrolled to bottom of page
     *
     * @param el, optional object
     * @return boolean
     */
    static isScrolledToBottom(el = null) {
        if (el == null)
            el = document.querySelector("html");

        return el.scrollTop ===
            (el.scrollHeight - el.offsetHeight);
    }

    /**
     * Display snackbar
     *
     * @param message - either a string, or data object
     */
    static snackbar(message) {
        let data = {};

        if(typeof message == "string")
            data = { message: message };
        else
            data = message;

        const snackbar = document.querySelector('.mdl-js-snackbar');

        if (typeof snackbar.attributes['hidden'] != "undefined") // ad block work around
            snackbar.attributes.removeNamedItem("hidden");

        snackbar.MaterialSnackbar.showSnackbar(data);

        return snackbar;
    }

    /**
     * Display an image in the full screen viewer
     */
    static displayImage(mediaLoader, messageId, type) {
        store.state.msgbus.$emit('showImage', { messageId: messageId, type: type });
    }

    /**
     * Color Change with Material Animations
     *
     * @param $el element
     * @param color new color
     */
    static materialColorChange($el, color) {

        const container = document.createElement("span"); // Overflow container
        const animator = document.createElement("span"); // Animation space

        container.appendChild(animator); // Prepare and insert in dom
        container.className = "animator";
        $el.insertBefore(container, $el.firstChild);

        animator.style.background = color; // Add background color
        $el.className += " transition"; // Add transition class for animation

        setTimeout(() => {
            $el.style.background = color;
            $el.style.backgroundColor = color;

            $el.className = $el.className.replace(" transition", "");

            $el.removeChild(container);
        }, 1250);
    }

    static addEventListeners(events, listener, object=window) {
        return events.map(
            (i) => {
                object.addEventListener(i, listener);

                return { event: i, listener, object };
            }
        );
    }

    static removeEventListeners(listener_array) {
        return listener_array.map(
            (i) => {
                i.object.removeEventListener(i.event, i.listener);
            }
        );
    }

    static firebaseConfig () {
        const config = {
            apiKey: "AIzaSyB0pMWyfvde4mbKO20t23EEGECEb5itD7I",
            authDomain: "messenger-42616.firebaseapp.com",
            databaseURL: "https://messenger-42616.firebaseio.com",
            storageBucket: "messenger-42616.appspot.com",
        };

        firebase.initializeApp(config);
    }

    // Set text color to meet WCAG 2.0 Success Criterion 1.4.3
    // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast
    static getTextColorBasedOnBackground(color) {
        let colorString = color.replace("rgba(", "").replace(")", "");
        colorString = colorString.replace("rgb(", "").replace(")", "");

        // Get actual colors in sRGB
        const  colorArray = colorString.split(",");
        const  red = this.getSRGB(colorArray[0]);
        const  green = this.getSRGB(colorArray[1]);
        const  blue = this.getSRGB(colorArray[2]);

        // Compute the relative luminance of the background color
        // https://www.w3.org/TR/WCAG20/#relativeluminancedef
        const  luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

        // Determine color based on the contrast ratio 4.5:1
        // https://www.w3.org/TR/WCAG20/#contrast-ratiodef
        return luminance < 0.233 ? "#fff" : "#000";
    }

    static getSRGB(component) {
        component = component / 255;
        component = (component <= 0.03928) ? component / 12.92 : Math.pow(((component + 0.055) / 1.055), 2.4);
        return component;
    }
}

Array.prototype.extend = function(array){
    this.push.apply(this, array);
};

/**
* Contains element
* @param element value
*/
Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1 ? true : false;
};

/**
* Contains element, by key
* @param key
* @param element value
*/
Array.prototype.containsObjKey = function(key, element) {

    for (let i = 0; i < this.length; i++)
        if (this[i][key] === element)
            return this[i];

    return false;
};
