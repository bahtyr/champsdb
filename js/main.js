/****************************************** VARS ***********************************************/

var modal;
var alert = {
    show: function() {
        $id("sticky-top").classList.remove("hide");
        setTimeout(() => $id("sticky-top").classList.add("hide"), 2000);
    }
};

/****************************************** ANALYTICS ******************************************/

function track(eventValue, eventType) {
    window.umami.trackEvent(eventValue, eventType);
}

/****************************************** GET ELEMENTS ***************************************/

var elements = {};
function $cached(x) { 
    if (!elements[x]) elements[x] = document.getElementById(x);
    return elements[x];
}

function $id(x)       { return document.getElementById(x);         }
function $class(x)    { return document.getElementsByClassName(x); }
function $tag(x)      { return document.getElementsByTagName(x);   }
function $query(x)    { return document.querySelector(x);          }
function $queryAll(x) { return document.querySelectorAll(x);       }
function $index(element, i = 0) {
    /* count previous siblings to find the elements index */
    while (element = element.previousElementSibling) i++;
    return i;
}

/****************************************** CLASSES ********************************************/

class Modal {
    el;

    constructor() {
        this.el = $class("modal")[0];
        this.el.addEventListener("click", () => this.close());
        $query(".modal .close").addEventListener("click", () => this.close());
        $class("modal-content")[0].addEventListener("click", e => e.stopPropagation());
    }

    show() {
        $tag("html")[0].classList.add("preventScroll");
        $tag("body")[0].classList.add("preventScroll");
        this.el.classList.add("show");
    }

    close() {
        $tag("html")[0].classList.remove("preventScroll");
        $tag("body")[0].classList.remove("preventScroll");
        this.el.classList.remove("show");
    }

    hasFocus() {
        return this.el.classList.contains("show");
    }
}

modal = new Modal;