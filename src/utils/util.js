
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
        string = string.replace(/\n/g, '<br />');

        while (string.indexOf("<") !== -1) {
            string = string.replace("<", "&lt;");
        }

        while (string.indexOf(">") !== -1) {
            string = string.replace(">", "&gt;");
        }

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
    static generateContact (id, title, color, accent, ligher, darker) {
        return {
            id: id,
            title: title,
            colors: {
                default: color,
                accent: accent,
                ligher: ligher,
                darker: darker
            }
        }
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

