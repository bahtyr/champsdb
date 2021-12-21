let champs = new ChampionListManager();
let tags = new TagsListManager();
let champsPrinter;
let champCard = {
	card: $("#champcard"),
	name: $("#champcard__name"),
	abilities: [
		{name: $(".ability__line:nth-child(2) .name"), img: $(".ability__line:nth-child(2) img")},
		{name: $(".ability__line:nth-child(3) .name"), img: $(".ability__line:nth-child(3) img")},
		{name: $(".ability__line:nth-child(4) .name"), img: $(".ability__line:nth-child(4) img")},
		{name: $(".ability__line:nth-child(5) .name"), img: $(".ability__line:nth-child(5) img")},
		{name: $(".ability__line:nth-child(6) .name"), img: $(".ability__line:nth-child(6) img")}],
	index: 0,
	show: function() { this.card.removeClass("hide");},
	hide: function() { this.card.addClass("hide"); champsPrinter.elements[champs.ii+1].classList.remove("active"); }
};

let alert = {element: $("#sticky-top"),
	show: function() {
		this.element.removeClass("hide");
		setTimeout(() => alert.element.addClass("hide"), 2000);
	}};
let filters = {clearSelection: function() {
	$(".search-filters svg.active").removeClass("active");
}}
let search = {element: null, wrapper: null, clearBtn: null,
	showClearBtn: function() { this.clearBtn.removeClass("hide");    },
	hideClearBtn: function() { this.clearBtn.addClass("hide"); },
	triggerKeyUp: function() {
		const event = new Event('keyup');
		this.element[0].dispatchEvent(event);
	}};
let searchState = {hasFocus: false, lastFocuTime: 0, canRestartTyping: false};
let sort = {element: null,
	reset: function() {
		// since we only keep "champ index" on our tag list, we have to revert the list before showing results
		// otherwise "champ index" taglist and the champ list indexes will not match
		const event = new Event('change');
		if (this.element.val() != "abc") {
			this.element.val("abc");
			this.element[0].dispatchEvent(event);
		}
	}};

$(function() {

	addPaddingsIfChampItemIsLarge();

	champsPrinter = new ElementPrinter("#champ-list", ".item");
	champs.printer = champsPrinter;
	search.element = $("#search");
	search.wrapper = $("#search__wrapper");
	search.clearBtn = $("#search__clear");
	sort.element =  $("#sort")

	champs.onLoad(() => {
		updateSearchResultsCount(0);
		initChampionsListDOM();
	});
	tags.onLoad(() => {
		initSidebarItems()
		initSidebar();
	});

	//search, filters, sort...
	listenSearch();
	listenFilters();
	listenSort();
	//champcard
	bindChampCardActions();
	//qol
	listenKeys();
	listenEmptyClicks();
	listenSearchTimeout();
	listenPageScroll();
});

$(window).on("resize", () => addPaddingsIfChampItemIsLarge());

function addPaddingsIfChampItemIsLarge() {
	const item = $(".item:not(.js-template)")[0];
	const list = $("#champ-list");

	if (document.body.clientWidth < 768) {
		if (item.clientWidth > 120) {
			list.css("padding-right", "8px");
			list.css("padding-left", "8px");
		} else {
			list.css("padding-right", "");
			list.css("padding-left", "");
		}
	} else {
		list.css("padding-right", "");
		list.css("padding-left", "");
	}
}

/* ---------------------------------------- SEARCH LISTENERS */

function listenSearch() {
	let prevLength = 0;
	search.element.keyup(function(e) {

		let s = $(this).val().toLowerCase();

		if (s.length == 0 && prevLength != 0)
			champCard.hide();
		
		if (s.length == 0) {
			updateSearchResultsCount(0);
			champs.unhideAll();
			search.hideClearBtn();
			return;
		}

		prevLength = s.length;
		filters.clearSelection();
		search.showClearBtn();
		champs.unhideAll();

		if (searchTag(s) == -1)
			searchText(s);
		updateSearchResultsCount();
	});

	search.clearBtn.on("click", function() {
		search.element.val("");
		search.triggerKeyUp();
	});
}

function listenFilters() {
	$(".search-filters svg").on("click", function(e) {
		
		champCard.hide();
		champs.unhideAll();

		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			updateSearchResultsCount(0);
			return;
		}

		search.element.val("");
		filters.clearSelection();
		$(this).addClass("active");

		switch($(this).parent()[0].id) {
			case "filter-lane": searchLaneOrRole($(this)[0].id, 0); break;
			case "filter-role": searchLaneOrRole($(this)[0].id, 1); break;
		}

		updateSearchResultsCount();
	});
}

function listenSort() {
	sort.element.on("change", function() {
		champCard.hide();

		switch (this.value) {
			case "abc": champs.items.sort(Champion.sortByName); break;
			case "release": champs.items.sort(Champion.sortByReleaseDateDesc); break;
			case "rework": break;
		}

		initChampionsListDOM();
	});
}

/* ---------------------------------------- SEARCH METHODS */

/**
 * This method hides everything else when there is match, therefore no other search functions should run after this.
 * Returns; 1: if there is match, otherwise -1
 */
function searchTag(str) {
	for (let i = 0; i < tags.items.length; i++) { //loop tags
		if (str == tags.items[i].name.toLowerCase() //on match;
			&& tags.items[i].champIndexes != null) {

			sort.reset();
			champs.hideAllExcept(tags.items[i].champIndexes);
			return 1;
		}
	}
	return -1;
}

function searchTagById(id) {
	for (let i = 0; i < tags.items.length; i++) { //loop tags
		if (id == tags.items[i].id && tags.items[i].champIndexes != null) {
					
			filters.clearSelection();
			sort.reset();
			search.showClearBtn();
			champs.hideAllExcept(tags.items[i].champIndexes);
			updateSearchResultsCount();
			return;
		}
	}
}

function searchText(str) {
	for (let i = 0; i < champs.items.length; i++) {
		if (champs.items[i].name.toLowerCase().includes(str) || 
			champs.items[i].id.toLowerCase().includes(str)) {
			champs.show(i);
		} else {
			champs.hide(i);
		}
	}

	showChampCardForFistVisibleChamps();
}

function searchLaneOrRole(str, type) {
	let matchFound = false;

	for (let i = 0; i < champs.items.length; i++, matchFound = false) {
		
		if (type == 0) { // lanes
			matchFound = champs.items[i].lanes.includes(str);
		} else { // roles
			for (let t in champs.items[i].tags) {
				if (champs.items[i].tags[t] == str) {
					matchFound = true;
				}
			}
		}

		if (matchFound)
			champs.show(i);
		else champs.hide(i);
	}
}

/* ---------------------------------------- CHAMPCARD */

/**
 * Put champion name, abilities and update links.
 * Does not auto show the card, only updates it.
 */
function updateChampCard(i) {
	// show / hide selected champion border
	champsPrinter.elements[champs.ii+1].classList.remove("active");
	champsPrinter.elements[champs.i+1].classList.add("active");

	if (champs.ii == i) return; // if same champ don't update the card again
	champs.ii = i; // keep prev. champ index

	champCard.index = i;
	champCard.name.text(champs.items[i].name);

	champCard.abilities[0].img.attr("src", champs.items[i].abilities[0].img);
	champCard.abilities[1].img.attr("src", champs.items[i].abilities[1].img);
	champCard.abilities[2].img.attr("src", champs.items[i].abilities[2].img);
	champCard.abilities[3].img.attr("src", champs.items[i].abilities[3].img);
	champCard.abilities[4].img.attr("src", champs.items[i].abilities[4].img);

	champCard.abilities[0].name.text(champs.items[i].abilities[0].name);
	champCard.abilities[1].name.text(champs.items[i].abilities[1].name);
	champCard.abilities[2].name.text(champs.items[i].abilities[2].name);
	champCard.abilities[3].name.text(champs.items[i].abilities[3].name);
	champCard.abilities[4].name.text(champs.items[i].abilities[4].name);

	const link1 = $("#champcard a:nth-child(2)");
	const link2 = $("#champcard a:nth-child(3)");
	link1.attr("href", Champion.getUrlWiki(champs.items[i].name));
	link2.attr("href", Champion.getUrlUniverse(champs.items[i].id));
}

/**
 * Copy ability name to clipboard on click.
 */
function bindChampCardActions() {
	$(".ability__line").on("click", function() {
		let s = "";
		s += champs.items[champs.i].abilities[$(this).index() - 1].name;
		switch ($(this).index() - 1) {
			case 0: s += " (P)"; break;
			case 1: s += " (Q)"; break;
			case 2: s += " (W)"; break;
			case 3: s += " (E)"; break;
			case 4: s += " (R)"; break;
		}

		navigator.clipboard.writeText(s);
		stickyAlert.removeClass("hide");
		setTimeout(() =>  stickyAlert.addClass("hide"), 2000);
	});
}

/*
 * To be used after a search method, shows champCard of the first champion.
 */
function showChampCardForFistVisibleChamps() {
	if (champs.visibleItems.length > 0) {
		// to allow to go to next champ directly, because first right arrow is 0 element,
		// since first champ's card will be open, we start i from 0
		champs.i = champs.visibleItems[0];
		champs.v = 0;
		updateChampCard(champs.i);
		champCard.show();
	} else champCard.hide();
}

/* ---------------------------------------- QUALITY OF LIFE */

/**
 * On key press immediately start typing on the search box.
 * Show next / prev champs on arrow keys.
 */
function listenKeys() {

	// note down search focus state
	// while we are at it also trigger fake hover to highlight the element
	search.element.on("focusin", () => {
		searchState.hasFocus = true
		search.wrapper[0].classList.add("hover");
	});
	search.element.on("blur", () => setTimeout(() => {
		searchState.hasFocus = false;
		search.wrapper[0].classList.remove("hover");
	}, 200));


	let prevKey;
	$(document).keydown(function(e) {
		
		// COPY (CTRL + C)
		if (e.which == 67 && prevKey == 17) return;

		prevKey = e.which;

		// LETTERS
		if ((e.which > 64 && e.which < 91) || e.which == 8) {
			if (!searchState.hasFocus) {
				search.element.focus();
			}

			if (searchState.canRestartTyping) {
				search.element.val("")
			}
		}

		searchState.canRestartTyping = false;
		searchState.lastFocuTime = Date.now();

		// ARROW KEYS
		if (e.which > 36 && e.which < 41) {

			// LEFT
			if (e.which == 37) {
				if (!searchState.hasFocus) {
					updateChampCard(champs.prevVisibleItem());
					champCard.show();
				}
			}
			// RIGHT
			else if (e.which == 39) {
				if (!searchState.hasFocus) {
					updateChampCard(champs.nextVisibleItem());
					champCard.show();
				} else {
					if (search.element[0].value.length == search.element[0].selectionEnd) {
						search.element.blur();
						updateChampCard(champs.nextVisibleItem());
						champCard.show();
					}
				}
			}
			// DOWN
			else if (e.which == 40) {
				if (!searchState.hasFocus) {
					if (!champCard.card.hasClass("hide"))
						e.preventDefault();
					champCard.hide();
				} else {
					if (search.element[0].value.length == search.element[0].selectionEnd) {
						e.preventDefault();
						search.element.blur();
						champCard.hide();
					}
				}
			}
		}
	});
}

/**
 * Upon clicking on an empty space hide the #champcard.
 * If search has focus, only clear focus. Don't hide immediately
 */
function listenEmptyClicks() {
	$("body").on("click", function(e) {
		if ((e.target.id == "champ-list__wrapper" || e.target.id == "champ-list" || 
			e.target.id == "header__main" || e.target.id == "footer" ||
			e.target.classList.value == "sides-inner right" || e.target.classList.value == "sides-outer right") &&
			!searchState.hasFocus) {
			champCard.hide();
		}
	});
}

/**
 * Check if it has been while since last typed.
 * Then within listenKeys() search text will be cleared before typing.
 */
function listenSearchTimeout() {
	setInterval(function() {
		if (Date.now() - searchState.lastFocuTime > 5000) {
			searchState.canRestartTyping = true;
		}
	}, 2000);
}

function listenPageScroll() {
	//https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#scroll_event_throttling
	let lastKnownScrollPosition = 0;
	let ticking = false;

	let cardHeight = champCard.card.outerHeight() - 30; //reducition is to allow for the champ item to be slighlty hidden
	let champList = $("#champ-list");
	let champListWrapper = $("#champ-list__wrapper");

	document.addEventListener('scroll', function(e) {
	  if (!ticking) {
	    window.requestAnimationFrame(function() {
	      if (window.scrollY > 1) {
	      	if (champList.outerHeight() > champListWrapper.outerHeight() - cardHeight && //if list height is bigger than visible area
	      		window.scrollY > lastKnownScrollPosition) { //only on scroll down
	      		champCard.hide();
	      	}
	      }

	      lastKnownScrollPosition = window.scrollY;
	      ticking = false;
	    });

	    ticking = true;
	  }
	});
}

/* ---------------------------------------- CHAMPIONS LIST */

function initChampionsListDOM() {
	champsPrinter.removaAllItems();
	champsPrinter.addAll(champs.items.length, (holder, i) => {

		if (champs.items[i].hide == true)
			holder.addClass("hide");
		else champs.visibleItems.push(i);

		holder.find("img").attr("src", champs.items[i].portrait);
		holder.find("span.name").text(champs.items[i].name);
	});
	
	champsPrinter.addSpaceItems(20);
	bindChampsClickListener();
}

/**
 * Show #champcard on click.
 */
function bindChampsClickListener() {
	$(champsPrinter.itemSelector).off("click");
	$(champsPrinter.itemSelector).on("click", function() {

		champs.i = $(this).index() - 1;
		champs.findIndexInVisibleItems(champs.i);
		
		if (champs.i == champs.ii && !champCard.card.hasClass("hide")) {
			// hide card upon clicking on the same champ twice
			champCard.hide();
			champsPrinter.elements[champs.i+1].classList.remove("active");
		} else {
			updateChampCard(champs.i);
			champCard.show();
		}
	});
}

function updateSearchResultsCount(showAll) {
	const text = $("#search__count");
	if (showAll == null)
		text.text(champs.visibleItems.length);
	else text.text(champs.items.length);
}

/* ---------------------------------------- SIDEBAR */

function initSidebar() {
	let sidebar = $("#sidebar");
	let sidebarOverlay = $("#sidebar__content-overlay");

	// show sidebar
	$("#site-icon").on("click", function() {
		sidebar.toggleClass("show");
		sidebarOverlay.toggleClass("show");
	});

	// hide sidebar upon clicking "empty area"
	sidebarOverlay.on("click", function() {
		sidebar.toggleClass("show");
		sidebarOverlay.toggleClass("show");
	});

	// search attribute
	$("#sidebar li span").on("click", function() {

		champCard.hide();

		let item = findMenuItemFromDOM(this);
		searchTagById(item.id);
		search.element.val($(this).text());
	});

	// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible_animate
	// uncollapse list
	$(".sidebar-subheading").on("click", function() {
		var content = this.nextElementSibling;
	    if (content.style.maxHeight){
	      content.style.maxHeight = null;
	    } else {
	      content.style.maxHeight = content.scrollHeight + "px";
	    } 
	});
}

function initSidebarItems() {
	let filterPrinter = new ElementPrinter("#filters-wrapper");

	for (let i in tags.tagsObj.menu) {
		
		let e;
		if (tags.tagsObj.menu[i].heading != null) { // HEADING
			e = filterPrinter.useTemplate(".sidebar-heading");
			e.text(tags.tagsObj.menu[i].heading);

		} else if (tags.tagsObj.menu[i].subheading != null) { // SUBHEADING
			e = filterPrinter.useTemplate(".sidebar-subheading");
			e.find("span").text(tags.tagsObj.menu[i].subheading);

		} else if (tags.tagsObj.menu[i].list != null) { // LIST
			e = ElementPrinter.startElement("ul", `class="section"`);
			for (let ii in tags.tagsObj.menu[i].list) {
				if (!Array.isArray(tags.tagsObj.menu[i].list[ii])) { // LIST ITEM
					// let li = filterPrinter.useTemplate("#filters-wrapper li");
					// li.find("a").attr("href", tags.tagsObj.menu[i].list[ii].link);
					// li.find("span").text(tags.tagsObj.menu[i].list[ii].text);
					// li.attr("title", tags.tagsObj.menu[i].list[ii].tooltip);
					// e += li[0].outerHTML;
					let li = filterPrinter.useTemplateAsString("#filters-wrapper li");
					li = li.replace("$text", tags.tagsObj.menu[i].list[ii].text);
					li = li.replace("$tooltip", tags.tagsObj.menu[i].list[ii].tooltip);
					e += li;
				} else { // NESTED LIST
					e += ElementPrinter.startElement("ul");
					for (let iii in tags.tagsObj.menu[i].list[ii]) { // NESTED LIST ITEM
						// let li = filterPrinter.useTemplate("#filters-wrapper li");
						// li.find("a").attr("href", tags.tagsObj.menu[i].list[ii][iii].link);
						// li.find("span").text(tags.tagsObj.menu[i].list[ii][iii].text);
						// li.attr("title", tags.tagsObj.menu[i].list[ii][iii].tooltip);
						// e += li[0].outerHTML;
						let li = filterPrinter.useTemplateAsString("#filters-wrapper li");
						li = li.replace("$text", tags.tagsObj.menu[i].list[ii][iii].text);
						li = li.replace("$tooltip", tags.tagsObj.menu[i].list[ii][iii].tooltip);
						e += li;
					}
					e += ElementPrinter.endElemenet("ul");
				} 
			}
			e += ElementPrinter.endElemenet("ul");
		}
		
		filterPrinter.parent.append(e);
	}
}

function findMenuItemFromDOM(element) {
	let isNestedList =    $(element).parent().parent().parent().is("ul");

	let itemIndex =       $(element).parent().index()
	let listIndex =       $(element).parent().parent().index();
	let nestedListIndex = $(element).parent().parent().index();
	
	if (isNestedList)
		listIndex =       $(element).parent().parent().parent().index();

	listIndex -= 3; // don't count hidden template elements

	if (!isNestedList)
		return tags.tagsObj.menu[listIndex].list[itemIndex];
	else return tags.tagsObj.menu[listIndex].list[nestedListIndex][itemIndex];
}