let stickyAlert = $("#sticky-top");
let champs = new ChampsList();
let tags = new ChampTags();
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
	hide: function() { this.card.addClass("hide"); champsPrinter.items[champs.ii+1].classList.remove("active"); }
};

$(window).on("resize", () => correctChampCardPosition());

$(function() {

	correctChampCardPosition();

	champsPrinter = new ElementPrinter("#champ-list", "#champ-list .item");

	listenKeys();
	listenEmptyClicks();
	initSearch();
	initSearchFilter();

	bindChampCardActions();

	champs.load(() => {
		tags.load(() => tags.putChampIndexesToTags(champs.items));

		champsPrinter.addAll(champs.items, (holder, i) => {
			holder.find("img").attr("src", champs.items[i].portrait);
			holder.find("span").text(champs.items[i].name);
		});
		champsPrinter.addSpaceItems(20);
		bindChampsClickListener();
	});
});

/* ---------------------------------------- */

function initSearch() {
	$("#search").keyup(function(e) {

		$(".search-filters svg.active").removeClass("active");

		let s = $(this).val().toLowerCase();
		
		if (s.length == 0) {
			showAllChamps();
			champCard.hide();
			return;
		}

		showAllChamps();
		if (searchTag(s) == -1)
			searchText(s);

		if (e.which == 39 && this.value.length == this.selectionEnd) {
			updateChampCard(champs.nextVisibleItem());
			$(this).blur();
		}
	});
}

function initSearchFilter() {
	$(".search-filters svg").on("click", function(e) {
		
		champCard.hide();
		showAllChamps();

		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			return;
		}

		$("#search").val("");
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
			&& tags.items[i].champs != null) {
			hideAllChampsExcept(tags.items[i].champs);
			showChampCardForFistVisibleChamps();
			return 1;
		}
	}
	return -1;
}

function searchText(str) {
	for (let i = 0; i < champs.items.length; i++) {
		if (champs.items[i].name.toLowerCase().includes(str) || 
			champs.items[i].id.toLowerCase().includes(str)) {
			champs.visibleItems.push(i);
			champsPrinter.items[i+1].classList.remove("hide");
		} else {
			champsPrinter.items[i+1].classList.add("hide");
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

		if (matchFound) {
			champs.visibleItems.push(i);
			champsPrinter.items[i+1].classList.remove("hide");
		} else champsPrinter.items[i+1].classList.add("hide");
	}
}

/* ---------------------------------------- */

/**
 * Show all items and clear array.
 */
function showAllChamps() {
	champsPrinter.parent.find(".hide").removeClass("hide");
	champs.visibleItems = [];
	champs.i = -1; //ChampsList.next/prevVisibleItem() handles -1 as default
	champs.v = -1;
}

/**
 * Instead of looping through every champion and checking their name every time before hiding,
 * 
 * this method;
 * - creates an index list,
 * - removes the exception(s) from our index list
 * - the hide everything that is left
 */
function hideAllChampsExcept(champIndex) {
	if (typeof champIndex == "number") champIndex = [champIndex]; // convert this to an array for easier handling

	// get a simple integer list with the length of champs
	let indexList = [];
	for (let i = 0; i < champs.items.length; i++)
		indexList.push(i);

	// for every element to NOT hide, remove the integer from the list above
	for (let i = 0; i < champIndex.length; i++)
		indexList[champIndex[i]] = null;
	
	// loop through our integer list, and hide every element except null
	for (let i = 0; i < indexList.length; i++) {
		if (indexList[i] != null)
			champsPrinter.items[indexList[i]+1].classList.add("hide");
	}

	// add the exceptions to the visible list
	for (let i = 0; i < champIndex.length; i++)
		champs.visibleItems.push(champIndex[i]);
}

/*
 *
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

/* ---------------------------------------- */

/**
 * On key press immediately start typing on the search box.
 * Show next / prev champs on arrow keys.
 */
function listenKeys() {
	let prevKey;
	$(document).keydown(function(e) {

		// C + CTRL
		if (e.which == 67 && prevKey == 17) return;
		prevKey = e.which;

		if ($(e.target).is('input, textarea, select')) return;
		if ((e.which > 64 && e.which < 91) || e.which == 8) {
			$("#search").focus();
		}

		switch (e.which) {
			case 37: //left
				updateChampCard(champs.prevVisibleItem());
				champCard.show();
				break;
			case 39: //right
				updateChampCard(champs.nextVisibleItem());
				champCard.show();
				break;
			case 40:
				if (!champCard.card.hasClass("hide"))
					e.preventDefault();
				champCard.hide();
			break;
			// case 38: //up
		}
	});
}

/**
 * Upon clicking on an empty space hide the #champcard.
 */
function listenEmptyClicks() {
	let searchHasFocus = false;
	$("#search").on("focusin", () => searchHasFocus = true);
	$("#search").on("blur", () => setTimeout(() => {searchHasFocus = false;}, 1000));
	$("#champ-list__wrapper").on("click", function(e) {
		if ((e.target.id == "champ-list__wrapper" || e.target.id == "champ-list") && !searchHasFocus) {
			champCard.hide();
		}
	});
}

/**
 * Match #champcard position to siteMaxWidth
 */
function correctChampCardPosition() {
	const siteHeader = $("#site-header__wrapper");
	champCard.card.css("left", siteHeader.css("margin-left"));
}

/**
 * Put champion name, abilities and update links.
 * 
 * To have a smooth navigation of champs the following cases are handled;
 * - typing even without a focus auto directs to search
 * - clicking on the sampe champ clears selection
 * - clicking on a blank space clears selection
 * - while searcing;
 *   - the first champ is selected
 *   - pressing right arrow key selects the next champ, if caret is at the end
 *   - the followings clear search focus withouting clearing selection to allow arrow keys navigation
 *     - clicking on a blank space does not immediately clear selection
 *     - pressing tab key focuses on an invisible element
 * - arrow keys navigates through visible champs
 *   - changing selection by clicking does not break arrow keys navigation on a filtered list
 *   - pressing arrow down key while champcard is open does not scroll the page
 * - when search is empty selection clears
 * - selecting filters clears selection
 */
function updateChampCard(i) {
	champsPrinter.items[champs.ii+1].classList.remove("active");
	champs.ii = i;
	champsPrinter.items[champs.i+1].classList.add("active");

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
	link1.attr("href", `https://leagueoflegends.fandom.com/wiki/${champs.items[i].name.replace("\\s","_")}/LoL#Abilities`);
	link2.attr("href", `https://universe.leagueoflegends.com/en_SG/champion/${champs.items[i].id}/`);
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
			champsPrinter.items[champs.i+1].classList.remove("active");
		} else {
			updateChampCard(champs.i);
			champCard.show();
		}
	});
}