let stickyAlert = $("#sticky-top");
let searchInfo = {hasFocus: false, lastFocuTime: 0, canRestartTyping: false, wrapper: null, clearBtn: null};
let search;

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

$(function() {

	champsPrinter = new ElementPrinter("#champ-list", ".item");
	champs.printer = champsPrinter;
	search = $("#search");
	searchInfo.wrapper = $("#search__wrapper");
	searchInfo.clearBtn = $("#search__clear");

	champs.onLoad(() => initChampionsListDOM());
	tags.onLoad(() => {
		initSidebarItems()
		initSidebar();
	});

	//search, sidebar, sort...
	initSearch();
	initSearchFilter();
	initSortSelector();
	//champcard
	bindChampCardActions();
	//qol
	listenKeys();
	listenEmptyClicks();
	listenSearchTimeout();
	listenPageScroll();
});

/* ---------------------------------------- SEARCH */

function initSearch() {
	let prevLength = 0;
	search.keyup(function(e) {

		$(".search-filters svg.active").removeClass("active");

		let s = $(this).val().toLowerCase();

		if (s.length == 0 && prevLength != 0)
			champCard.hide();
		
		if (s.length == 0) {
			champs.unhideAll();
			searchInfo.clearBtn.addClass("hide");
			return;
		}

		searchInfo.clearBtn.removeClass("hide");

		prevLength = s.length;

		champs.unhideAll();
		if (searchTag(s) == -1)
			searchText(s);
	});

	searchInfo.clearBtn.on("click", function() {
		search.val("");
		const event = new Event('keyup');
		search[0].dispatchEvent(event);
	});
}

function initSearchFilter() {
	$(".search-filters svg").on("click", function(e) {
		
		champCard.hide();
		champs.unhideAll();

		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			return;
		}

		search.val("");
		$(".search-filters svg.active").removeClass("active");
		$(this).addClass("active");

		switch($(this).parent()[0].id) {
			case "filter-lane": searchLaneOrRole($(this)[0].id, 0); break;
			case "filter-role": searchLaneOrRole($(this)[0].id, 1); break;
		}
	});
}

/**
 * This method hides everything else when there is match, therefore no other search functions should run after this.
 * Returns; 1: if there is match, otherwise -1
 */
function searchTag(str) {
	for (let i = 0; i < tags.items.length; i++) { //loop tags
		if (str == tags.items[i].name.toLowerCase() //on match;
			&& tags.items[i].champIndexes != null) {

			champs.hideAllExcept(tags.items[i].champIndexes);
			// showChampCardForFistVisibleChamps();
			return 1;
		}
	}
	return -1;
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
		// s += champs.items[champs.i].name + " ";
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
	search.on("focusin", () => {
		searchInfo.hasFocus = true
		searchInfo.wrapper[0].classList.add("hover");
	});
	search.on("blur", () => setTimeout(() => {
		searchInfo.hasFocus = false;
		searchInfo.wrapper[0].classList.remove("hover");
	}, 200));


	let prevKey;
	$(document).keydown(function(e) {
		
		// COPY (CTRL + C)
		if (e.which == 67 && prevKey == 17) return;

		prevKey = e.which;

		// LETTERS
		if ((e.which > 64 && e.which < 91) || e.which == 8) {
			if (!searchInfo.hasFocus) {
				search.focus();
			}

			if (searchInfo.canRestartTyping) {
				search.val("")
			}
		}

		searchInfo.canRestartTyping = false;
		searchInfo.lastFocuTime = Date.now();

		// ARROW KEYS
		if (e.which > 36 && e.which < 41) {

			// LEFT
			if (e.which == 37) {
				if (!searchInfo.hasFocus) {
					updateChampCard(champs.prevVisibleItem());
					champCard.show();
				}
			}
			// RIGHT
			else if (e.which == 39) {
				if (!searchInfo.hasFocus) {
					updateChampCard(champs.nextVisibleItem());
					champCard.show();
				} else {
					if (search[0].value.length == search[0].selectionEnd) {
						search.blur();
						updateChampCard(champs.nextVisibleItem());
						champCard.show();
					}
				}
			}
			// DOWN
			else if (e.which == 40) {
				if (!searchInfo.hasFocus) {
					if (!champCard.card.hasClass("hide"))
						e.preventDefault();
					champCard.hide();
				} else {
					if (search[0].value.length == search[0].selectionEnd) {
						e.preventDefault();
						search.blur();
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
			!searchInfo.hasFocus) {
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
		if (Date.now() - searchInfo.lastFocuTime > 5000) {
			searchInfo.canRestartTyping = true;
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
		holder.find("span.tooltip").text("Patch " + champs.items[i].releasePatch);
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

/* ---------------------------------------- */

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
		search.val($(this).text());
		const event = new Event('keyup');
		search[0].dispatchEvent(event);
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

function initSortSelector() {
	$("#sort").on("change", function() {
		champCard.hide();

		switch (this.value) {
			case "abc": champs.items.sort(Champion.sortByName); break;
			case "release": champs.items.sort(Champion.sortByReleaseDateDesc); break;
			case "rework": break;
		}

		initChampionsListDOM();
	});
}