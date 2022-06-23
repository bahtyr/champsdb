/****************************************** VARS ***********************************************/

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

    constructor(id) {
        if (id) this.el = $id(id);
        else this.el = $class("modal")[0];
        this.el.addEventListener("click", () => this.close());
        this.el.getElementsByClassName("modal-close")[0].addEventListener("click", () => this.close());
        this.el.getElementsByClassName("modal-content")[0].addEventListener("click", e => e.stopPropagation());
        modals.register(this);
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

var modals = {
    /**
     * A helper var to execute functions on all available modals.
     */
    arr: [],

    register(modalObj) {
        this.arr.push(modalObj);
    },

    closeAll() {
        for (let modal of this.arr)
            modal.close();
    },

    hasFocus() {
        for (let modal of this.arr)
            if (modal.hasFocus()) return true;
        return false;
    },
};