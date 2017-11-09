import jump from 'jump.js'

export default class Util {
    /**
     * Expand color to full RGBA string
     * 
     * @param raw rgba value
     * @return RGBA string
     */
    static expandColor (num) {
        num >>>= 0;

        var b = num & 0xFF,
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

        let snippet = object.snippet || object.data;
        let type = object.message_type || object.type;
        let mime_type = object.mime_type || "text/plain";
        
        
        snippet = mime_type == "text/plain" ? (snippet) : "<i>Photo</i>";

        if (type != 0 && type != 6 && type != 3 && type != 5)
            snippet = "You: " + snippet;

        return snippet;
        
    }

    static generateContact (id, title, mute, private_notifications, color, accent, ligher, darker) {
        return {
            id: id,
            title: title,
            mute: mute,
            private_notifications: private_notifications,
            colors: {
                default: color,
                accent: accent,
                ligher: ligher,
                darker: darker
            }
        }
    }

    /**
        * Scroll to bottom
        * Scrolls thread to bottom of page; uses tween easing
        *
        * @param speed - default to zero (no animation)
        */
    static scrollToBottom(speed=0) {

        const docu = document.getElementsByTagName("html")[0].clientHeight
        const body = document.getElementsByTagName("body")[0].clientHeight

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

    static snackbar(message) {
        var data = {}

        if(typeof message == "string")
            data = { message: message };
        else
            data = message

        var snackbar = document.querySelector('.mdl-js-snackbar');

        if (typeof snackbar.attributes['hidden'] != "undefined") // ad block work around
            snackbar.attributes.removeNamedItem("hidden");

        snackbar.MaterialSnackbar.showSnackbar(data);
    }

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
}

/**
* Contains element
* @param element value
*/
Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1 ? true : false
}

/**
* Contains element, by key
* @param key
* @param element value
*/
Array.prototype.containsObjKey = function(key, element) {

    for (var i = 0; i < this.length; i++) 
        if (this[i][key] === element)
            return true

    return false
}

