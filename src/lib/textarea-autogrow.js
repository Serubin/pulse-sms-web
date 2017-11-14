import { Util } from '@/utils'

export default class AutoGrow {
    
    constructor (options) {

        this.content     = null;
        this.textarea    = null;
        this.mirror      = null;

        this.row = 0;
        
        this.settings = {
            extra_line: false,
            content_el: undefined
        }

        this.content = document.getElementsByClassName("page-content")[0];
        
        if(typeof options.target == "undefined")
           throw { 
                name:        "TargetUndefined", 
                level:       "Severe", 
                message:     "Target textarea required.", 
                toString:    function(){return this.name + ": " + this.message;} 
            }; 

        this.textarea = options.target

        if(typeof options.extra_line != "undefined" || typeof options.extraLine != "undefined")
            this.settings.extra_line = options.extra_line || options.extraLine;

        if(typeof options.content_el != "undefined" || typeof options.content_el != "undefined")
            this.settings.content_el = options.content_el || options.content_el;

        this.createMirror();

        this.setSize();

		this.textarea.onkeyup = this.updateMirrorContent;
		this.textarea.onfocus = this.updateMirrorContent;
        this.textarea.onchange = this.updateMirrorContent;
        
        this.updateMirrorContent();

    }

    createMirror () {
        // Craete mirror el
        this.mirror = document.createElement('div');
        this.mirror.className = "autogrow-textarea-mirror";

        if (this.textarea.parentNode) // Insert
            this.textarea.parentNode.insertBefore( this.mirror, this.textarea.nextSibling );

    }

    updateMirrorContent = (e) => {
        this.mirror.innerHTML = String(this.textarea.value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br />')
            + (this.settings.extra_line ? "<br />" : "");


        let mirrorHeight = this.getHeight(this.mirror);
        let textareaHeight = this.getHeight(this.textarea);

        this.textarea.style.height = mirrorHeight + 10 + "px";

        let margin = 24 + mirrorHeight;
        if(textareaHeight != mirrorHeight && typeof this.settings.content != undefined) {
            
            if(margin < 54)
                this.settings.content_el.style.marginBottom = "54px";
            else
                this.settings.content_el.style.marginBottom = margin + "px";

        }
    }

    setSize () {
        this.mirror.style.display = 'none';
		this.mirror.style.wordWrap = 'break-word';
		this.mirror.style.whiteSpace = 'pre-wrap';

        this.mirror.style.padding = 
            this.textarea.style.paddingTop + ' ' +
			this.textarea.style.paddingRight + ' ' +
			this.textarea.style.paddingBottom + ' ' +
			this.textarea.style.paddingLeft;
            
        this.mirror.style.borderStyle = this.textarea.style.borderTopStyle + ' ' +
                this.textarea.style.borderRightStyle + ' ' +
                this.textarea.style.borderBottomStyle + ' ' +
                this.textarea.style.borderLeftStyle;

        this.mirror.style.borderWidth = this.textarea.style.borderTopWidth + ' ' +
            this.textarea.style.borderRightWidth + ' ' +
            this.textarea.style.borderBottomWidth + ' ' +
            this.textarea.style.borderLeftWidth;

        this.mirror.style.width = this.textarea.style.width;
        this.mirror.style.fontFamily = this.textarea.style.fontFamily;
        this.mirror.style.fontSize = this.textarea.style.fontSize;
        this.mirror.style.lineHeight = this.textarea.style.lineHeight;
        this.mirror.style.letterSpacing = this.textarea.style.letterSpacing;

        this.textarea.style.overflow = "hidden";
		this.textarea.style.minHeight = this.rows + "em";

    }

    getHeight (el) {
        let el_style      = window.getComputedStyle(el),
            el_display    = el_style.display,
            el_position   = el_style.position,
            el_visibility = el_style.visibility,
            el_max_height = el_style.maxHeight.replace('px', '').replace('%', ''),

            wanted_height = 0;

        // if its not hidden we just return normal height
        if(el_display !== 'none' && el_max_height !== '0') 
            return el.clientHeight;

        // the element is hidden so:
        // making the el block so we can meassure its height but still be hidden
        el.style.position   = 'absolute';
        el.style.visibility = 'hidden';
        el.style.display    = 'block';

        wanted_height     = el.clientHeight;

        // reverting to the original values
        el.style.display    = el_display;
        el.style.position   = el_position;
        el.style.visibility = el_visibility;

        return wanted_height;
    }

}
