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
}

