/****************************************** CHAMPLIST ********************************************/

$id("champ-list").addEventListener("click", e => {
	// loop parent nodes from the target to the delegation node
	for (let target = e.target; target != e.currentTarget && target && target != this; target = target.parentNode) {
		if (target && target.matches(".item")) {

			champlist.onClick($index(target, -1));
			break;
		}
	}
});

/****************************************** CHAMPCARD ********************************************/

$id("champcard__ability-col").addEventListener("click", e => {
	for (let target = e.target; target != e.currentTarget && target && target != this; target = target.parentNode) {
		if (target) {

			if (target.matches(".ability-wrapper")) {
				champcard.onClickAbility($index(target, -1));
				break;
			}

			else if(target.matches(".action")) {
				champcard.onClickCopy($index(target.parentNode, -1));
				break;
			}
		}
	}
});

$id("ability-tags").addEventListener("click", e => {
	// children (p) don't have ids, if target doesn't have id it must be a tag
	if (!e.target.id) {
		champcard.onClickTag($index(e.target));
	}
});

/****************************************** SEARCH ***********************************************/

$id("search__clear").addEventListener("click", search?.clear);

/* the main search field listener */
$id("search").addEventListener("input", e => search.onInput(e));

$id("search").addEventListener("focusin", () => {
	search.hasFocus = true;
	$id("search__wrapper").classList.add("hover");
});

$id("search").addEventListener("blur", () => setTimeout(() => {
	search.hasFocus = false;
	$id("search__wrapper").classList.remove("hover");
}, 200));

$id("search").addEventListener("blur", () => {
	if (autocomplete.isVisible()) autocomplete.reset();
});

/****************************************** SEARCH RELATED ****************************************/

$id("search__tags").addEventListener("click", e => {
	e.target.id !== "search__tags" &&  search.queryRemove(null, null, null, $index(e.target));
});

$queryAll(".export-tooltip a").forEach(el => el.addEventListener("click", e => {
	champlist.exportVisibleItems(e.target.id);
}));

function onPrefTextChange(el) {
	search.prefs.text = parseInt(el.value);
}

function onPrefTagsChange(el) {
	search.prefs.tags = el.checked ? 1 : 0;
}

/****************************************** FILTERS **********************************************/

$id("filter-row").addEventListener("click", e => {
	for (let target = e.target; target != e.currentTarget && target && target != this; target = target.parentNode) {
		if (target && target.matches(".role-icon")) {
			
			filters.roles.onClick(e.target, e.target.id, e.target.parentNode.id);
			break;
		}
	}
});

[].forEach.call($class("attributes-checkbox"), el => el.addEventListener("change", e => {
	filters.attributes.onChange(e.target);
}));

/****************************************** SIDEBAR **********************************************/

$id("taglist-container").addEventListener("click", e => {
	for (let target = e.target; target != e.currentTarget && target && target != this; target = target.parentNode) {
		if (target) {
			
			if (target.matches(".sidebar-subheading")) {
				sidebar.onClickSubheading(target);
				break;
			}

			else if (target.matches(".sidebar-list-item")) {
				sidebar.onClickListItem(target);
				break;
			}
		}
	}
});

// mobile actions
$id("site-header__hamburger").addEventListener("click", sidebar.show);
$id("sidebar__content-overlay").addEventListener("click", sidebar.hide);

/****************************************** BODY *************************************************/

/**
 * upon clicking on an empty space hide the champcard.
 * if search has focus, only clear focus. Don't hide immediately.
 */
$tag("body")[0].addEventListener("click", e => {
	if ((e.target.id === "champ-list__wrapper"
		|| e.target.id === "champ-list"
		|| e.target.id === "header"
		|| e.target.id === "footer"
		|| e.target.id === "filter-row"
		|| e.target.id === "sidebar"
		|| e.target.id === "sidebar-right") &&
		!search.hasFocus) {
		champlist.deselect();
		filters.attributes.hideModal();
		track("Empty Area", "click");
	}
});

/****************************************** KEYS *************************************************/


/**
 * handled keydown cases:
 * - any key:               focus #search
 * - arrow keys left/right: select champ
 * - arrow keys up/down:    select ability
 * - esc:                   dismiss popup/modal, clear search
 */
let prevKey;
let keyPressTime;
document.addEventListener("keydown", e => {

	filters.attributes.hideModal();

	// COPY (CTRL + C)
	if (e.which == 67 && prevKey == 17) return;

	prevKey = e.which;
	search.lastFocuTime = Date.now();

	// LETTERS
	if ((e.which > 64 && e.which < 91) || e.which == 8) {
		if (!search.hasFocus)
			$id("search").focus();
	}

	// BACKSPACE
	if (e.which == 8) {
		if (search.text.length == 0 && search.query.length > 0) {
			search.queryRemove(null, null, null, search.query.length - 1);
		}
	}

	// SPACE
	if (e.which == 32 && champcard.isOpen() && !search.hasFocus) {
		e.preventDefault();
	}

	// ESC KEY
	if (e.which == 27) {
		if (typeof modal !== "undefined" && modal.hasFocus()) modal.close();
		else { // close champcard
			search.el.blur();
			champlist.deselect();
			if (Date.now() - keyPressTime < 500) // if double press
				search.clear(); //clear search
		}
		keyPressTime = Date.now();
		// we don't don't check if the prev key was also escape because, 
		// key press time is only reigstered if the key is escape
	}

	// ENTER KEY
	if (e.which == 13) {
		if (autocomplete.isVisible()) {
			autocomplete.select();
		}
	}

	// ARROW KEYS
	if (e.which > 36 && e.which < 41) {

		// LEFT
		if (e.which == 37) {
			if (!search.hasFocus) {
				champlist.selectPrevVisibleItem();
			}
		}
		// RIGHT
		else if (e.which == 39) {
			if (!search.hasFocus) {
				champlist.selectNextVisibleItem();

			} else {
				if ($id("search").value.length == $id("search").selectionEnd) {
					$id("search").blur();
					champlist.selectNextVisibleItem();
				}
			}
		}
		// UP autocomplete
		else if (e.which == 38 && autocomplete.isVisible()) {
			e.preventDefault();
			autocomplete.focusPrev();
		}
		// DOWN autocomplete
		else if (e.which == 40 && autocomplete.isVisible()) {
			e.preventDefault();
			autocomplete.focusNext();
		}
		// UP
		else if (e.which == 38 && champcard.isOpen()) {
			e.preventDefault();
			champcard.prevAbility();
		}
		// DOWN
		else if (e.which == 40 && champcard.isOpen()) {
			e.preventDefault();
			champcard.nextAbility();
		}
	}
});

/****************************************** WINDOW RELATED ***************************************/

// initial calculation
champcard.calculateWidth();

window.addEventListener("resize", () => {
	champcard.calculateWidth();
});

let scroll_ = {
	ticking: false,
	scrollPosOnStart: 0,
	timer: null,
	timerFn: function() { scroll_.scrollPosOnStart = window.scrollY;  }, //after a while, make current scroll pos. as starting position
	cardHeight: $id("champcard").offsetHeight - 30, //reducition is to allow for the champ item to be slighlty hidden
	champList: $id("champ-list"),
	champListWrapper: $id("champ-list__wrapper"),
	preventHide: false,
	scrollForOverflowingChamp: function(y) {
		/**
		 * is called by champlist.select()
		 * 
		 * y = get current champ's position Y
		 * to not trigger scrollListener preventHide
		 * disable preventHide with a delay, to account for smooth scrolling duration
		 */
		y = champlist.elements[$champ].getBoundingClientRect().bottom;
		scroll_.preventHide = true;

		if (y > window.innerHeight - 350) {
			window.scroll({behavior: 'smooth', top: window.scrollY + y - (window.innerHeight - 400)});
		} else if (y < 100) {
			window.scroll({behavior: 'smooth', top: window.scrollY - (120 - y)});
		}

		setTimeout(() => scroll_.preventHide = false, 400);
	}
};

document.addEventListener("scroll", e => {
	//https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#scroll_event_throttling
	if (!scroll_.ticking) {

		if (scroll_.timer !== null) clearTimeout(scroll_.timer);

		window.requestAnimationFrame(function() {
			if (window.scrollY - scroll_.scrollPosOnStart > 0) { // when scrolling down
				if (scroll_.champList.offsetHeight > scroll_.champListWrapper.offsetHeight - scroll_.cardHeight && //if list height is bigger than visible area
					window.scrollY - scroll_.scrollPosOnStart > 170 && !scroll_.preventHide) { //if scroll down diff is bigger than a champ's height
					champlist.deselect();
				}
			}
			scroll_.ticking = false;
		});
		scroll_.timer = setTimeout(scroll_.timerFn, 400);
		scroll_.ticking = true;
	}
});