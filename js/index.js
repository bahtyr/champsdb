let champs = new ChampionListManager();
let tags;
let champsPrinter;
let champCard = {
	card: $("#champcard"),
	name: $("#champcard__name"),
	title: $("#champcard__title"),
	index: 0,
	activeAbility: 0,
	show: function(elementPosY) { 
		this.card.removeClass("hide"); 
		champsPrinter.parent.addClass("spotlight");

		if (elementPosY == null) return;
		if (elementPosY = -11) // is called by arrow keys
			elementPosY = champsPrinter.elements[champs.i+1].getBoundingClientRect().bottom;

		champCard.preventHide = true;
		scrollForOverflowingChamp(elementPosY);
		setTimeout(() => champCard.preventHide = false, 500);
	},
	hide: function() {
		this.card.addClass("hide");
		champsPrinter.parent.removeClass("spotlight");
		champsPrinter.elements[champs.ii+1].classList.remove("active");
	},
	isOpen: function() { return !this.card.hasClass("hide"); },
	nextAbility: function() { if (this.activeAbility +1 < +5) this.activeAbility++; return this.activeAbility; },
	prevAbility: function() { if (this.activeAbility -1 > -1) this.activeAbility--; return this.activeAbility;; }
};

let alert = {element: $("#sticky-top"),
	show: function() {
		this.element.removeClass("hide");
		setTimeout(() => alert.element.addClass("hide"), 2000);
	}};
let filters = {clearSelection: function() {
	$(".search-filters svg.active").removeClass("active");
}}
let search = {element: null, wrapper: null, clearBtn: null, text: null, tagId: null,
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
	setCardWith();
	addPaddingsIfChampItemIsLarge();

	champsPrinter = new ElementPrinter("#champ-list", ".item");
	champs.printer = champsPrinter;
	search.element = $("#search");
	search.wrapper = $("#search__wrapper");
	search.clearBtn = $("#search__clear");
	sort.element =  $("#sort");
	initChampCard();

	champs.onLoad(() => {
		updateSearchResultsCount(0);
		initChampionsListDOM();
	});
	Tags.loadTags((data) => {
		tags = data;
		Tags.combineChampsAndTags(tags, true);
		initSidebarItems()
		initSidebar();

		listenSidebarMenu();
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

/* ---------------------------------------- SEARCH LISTENERS */

function listenSearch() {
	let prevLength = 0;
	search.element.keyup(function(e) {

		let s = $(this).val().toLowerCase();
		search.text = s;

		if (s.length == 0) {
			if (prevLength != 0)
				champCard.hide();
			updateSearchResultsCount(0);
			champs.unhideAll();
			search.hideClearBtn();
			return;
		}

		window.scrollTo({top: 0});
		prevLength = s.length;
		filters.clearSelection();
		search.showClearBtn();
		champs.unhideAll();

		if (!searchTagByText(s))
		if (!searchChampionAttribute("species", s))
		if (!searchChampionAttribute("region", s))
			searchText(s);

		showChampCardForFirstVisibleChamp();
		updateSearchResultsCount();

		highlightSearchText();
	});

	search.clearBtn.on("click", function() {
		search.element.val("");
		search.hideClearBtn();
		filters.clearSelection();
		champs.unhideAll();
		champCard.hide();
		updateSearchResultsCount(0);
	});
}

function listenFilters() {
	$(".search-filters svg").on("click", function(e) {
		
		window.scrollTo({top: 0});
		champCard.hide();
		champs.unhideAll();

		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
			search.element.val("");
			search.hideClearBtn();
			updateSearchResultsCount(0);
			return;
		}

		filters.clearSelection();
		$(this).addClass("active");

		switch($(this).parent()[0].id) {
			case "filter-lane": searchLaneOrRole($(this)[0].id, 0); break;
			case "filter-role": searchLaneOrRole($(this)[0].id, 1); break;
		}

		search.element.val($(this)[0].id);
		search.showClearBtn();
		updateSearchResultsCount();
	});
}

function listenSidebarMenu() {
	$("#sidebar li span").on("click", function() {

		window.scrollTo({top: 0});
		champCard.hide();
		champs.unhideAll();
		filters.clearSelection();

		let item = findMenuItemFromDOM(this);
		switch (item.id) {
			case -1: return;
			case -2: searchChampionAttribute("region", item.text.toLowerCase()); break;
			case -3: searchChampionAttribute("species", item.text.toLowerCase()); break;
			default: searchTagById(item.id); break;
		}

		search.element.val(item.text);
		search.showClearBtn();
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
 * Search methods return TRUE when the method is successful. (This currently only matters when the user is searching by typing (@listenSearch()))
 * The methods either;
 *   - loop through champions and lookup their attributes, then use champ.show(i) / champ.hide(i) methods.
 *   - loop through tags then use champs.hideAllExcept(arr) function
 * These methods are only responsible for showing / hiding champions, things like showing the clear button, updating the results count and etc. 
 * are handled by event handlers (see @listen() functions).
 * * Only exception is sort.reset() which needs to be executed before champs.hideAllExcept(arr) method.
 */

function searchText(str) {
	for (let i = 0; i < champs.items.length; i++) {
		if (Champion.getChampionAsSearchableText(champs.items[i]).toLowerCase().includes(str)) {
			champs.show(i);
		} else {
			champs.hide(i);
		}
	}
}

function searchTagByText(str) {
	for (let i = 0; i < tags.tags.length; i++) { //loop tags
		if (str == tags.tags[i].name.toLowerCase() //on match;
			&& tags.tags[i].champIndexes != null) {

			search.tagId = tags.tags[i].id;
			sort.reset();
			champs.hideAllExcept(tags.tags[i].champIndexes);
			showAbilityKeysOnChamps();
			return true;
		}
	}
	return false;
}

function searchTagById(id) {
	for (let i = 0; i < tags.tags.length; i++) { //loop tags
		if (id == tags.tags[i].id && tags.tags[i].champIndexes != null) {
					
			search.tagId = id;
			sort.reset();
			champs.hideAllExcept(tags.tags[i].champIndexes);
			showAbilityKeysOnChamps();
			return true;
		}
	}

	search.tagId = null;
	return false;
}

function searchLaneOrRole(str, type) {
	let anyMatchFound = false;
	let matchFound = false;

	for (let i = 0; i < champs.items.length; i++, matchFound = false) {
		
		if (type == 0)
			matchFound = champs.items[i].lanes.includes(str);
		else matchFound = champs.items[i].tags.includes(str);

		if (matchFound) {
			anyMatchFound = true;
			champs.show(i);
		} else champs.hide(i);
	}

	if (anyMatchFound)
		return true;
	else return false;
}

function searchChampionAttribute(attr, text) {
	let anyMatchFound = false;
	let matchFound = false;

	for (let i = 0; i < champs.items.length; i++, matchFound = false) {
		
		if (champs.items[i][attr].toLowerCase() == text) {
			matchFound = true;
			anyMatchFound = true;
			champs.show(i);
		} else champs.hide(i);
	}

	if (anyMatchFound)
		return true;
	else return false;
}

/* ---------------------------------------- CHAMPCARD */

function initChampCard() {
	champCard.table = {
		activeAbility: {
			indicator: $("#champcard__active-ability-indicator"),
			description: $("#ability-desc"),
			tags: $("#ability-tags"),
			scaling: $("#ability-scalings"),
			videoBtn: $("#video-btn"),
			video: $("video")},
		ability: [
				{row:  $(".col:nth-child(1) .row:nth-child(2)"), key: $(".row:nth-child(2) .ability .key"), img: $(".row:nth-child(2) .ability img"), name: $(".row:nth-child(2) .ability .name")},
				{row:  $(".col:nth-child(1) .row:nth-child(3)"), key: $(".row:nth-child(3) .ability .key"), img: $(".row:nth-child(3) .ability img"), name: $(".row:nth-child(3) .ability .name")},
				{row:  $(".col:nth-child(1) .row:nth-child(4)"), key: $(".row:nth-child(4) .ability .key"), img: $(".row:nth-child(4) .ability img"), name: $(".row:nth-child(4) .ability .name")},
				{row:  $(".col:nth-child(1) .row:nth-child(5)"), key: $(".row:nth-child(5) .ability .key"), img: $(".row:nth-child(5) .ability img"), name: $(".row:nth-child(5) .ability .name")},
				{row:  $(".col:nth-child(1) .row:nth-child(6)"), key: $(".row:nth-child(6) .ability .key"), img: $(".row:nth-child(6) .ability img"), name: $(".row:nth-child(6) .ability .name")}],
		col: [
			{row: [
				$(".col:nth-child(1) .row:nth-child(2) p.name"),
				$(".col:nth-child(1) .row:nth-child(3) p.name"),
				$(".col:nth-child(1) .row:nth-child(4) p.name"),
				$(".col:nth-child(1) .row:nth-child(5) p.name"),
				$(".col:nth-child(1) .row:nth-child(6) p.name")]},
			{row: [
				$(".col:nth-child(2) .row:nth-child(2) p"),
				$(".col:nth-child(2) .row:nth-child(3) p"),
				$(".col:nth-child(2) .row:nth-child(4) p"),
				$(".col:nth-child(2) .row:nth-child(5) p"),
				$(".col:nth-child(2) .row:nth-child(6) p")]},
			{row: [
				$(".col:nth-child(3) .row:nth-child(2) p"),
				$(".col:nth-child(3) .row:nth-child(3) p"),
				$(".col:nth-child(3) .row:nth-child(4) p"),
				$(".col:nth-child(3) .row:nth-child(5) p"),
				$(".col:nth-child(3) .row:nth-child(6) p")]},
			{row: [
				$(".col:nth-child(4) .row:nth-child(2) p"),
				$(".col:nth-child(4) .row:nth-child(3) p"),
				$(".col:nth-child(4) .row:nth-child(4) p"),
				$(".col:nth-child(4) .row:nth-child(5) p"),
				$(".col:nth-child(4) .row:nth-child(6) p")]}],
		icons: {
			region: $("#champcard__region"),
			lane: {
				Top: $("#champcard__top"),
				Jungle: $("#champcard__jungle"),
				Middle: $("#champcard__mid"),
				Bottom: $("#champcard__bot"),
				Support: $("#champcard__sup")},
			role: {
				Tank: $("#champcard__tank"),
				Fighter: $("#champcard__fighter"),
				Assassin: $("#champcard__assassin"),
				Mage: $("#champcard__mage"),
				Marksman: $("#champcard__marksman"),
				Support: $("#champcard__support")},
			rangeType: $("#champcard__rangetype"),
			resource: $("#champcard__resource")},
		links: {
			wiki: $("a#champ_wiki"),
			universe: $("a#champ_universe"),
			patchNotes: $("a#champ_patchnotes"),
			spotlight: $("a#champ_spotlight")},
		ratings: {
			damage: $("#champcard__table .bars .bar-wrapper:nth-child(1)"),
			mobility: $("#champcard__table .bars .bar-wrapper:nth-child(2)"),
			toughness: $("#champcard__table .bars .bar-wrapper:nth-child(3)"),
			control: $("#champcard__table .bars .bar-wrapper:nth-child(4)"),
			utility: $("#champcard__table .bars .bar-wrapper:nth-child(5)"),
			damageType: $("#damage-bar"),
			difficulty: $("#difficulty-bar"),
			style: {
				icons: $("#style-bar-wrapper"),
				bar: $("#style-bar .bar")},
			damageBreakdown: {
				tooltip: $("#damage-bar"),
				magic: $("#damage-bar .bar.magic"),
				physical: $("#damage-bar .bar.physical"),
				true_: $("#damage-bar .bar.true")
			}
		}
	};
}

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
	champCard.title.text(champs.items[i].title);

	// ABILITIES
	champCard.table.ability[0].row.removeClass("highlight");
	champCard.table.ability[1].row.removeClass("highlight");
	champCard.table.ability[2].row.removeClass("highlight");
	champCard.table.ability[3].row.removeClass("highlight");
	champCard.table.ability[4].row.removeClass("highlight");

	champCard.table.ability[0].img.attr("src", "assets/placeholder.png");
	champCard.table.ability[1].img.attr("src", "assets/placeholder.png");
	champCard.table.ability[2].img.attr("src", "assets/placeholder.png");
	champCard.table.ability[3].img.attr("src", "assets/placeholder.png");
	champCard.table.ability[4].img.attr("src", "assets/placeholder.png");

	champCard.table.ability[0].img.attr("src", champs.items[i].abilities[0].img);
	champCard.table.ability[1].img.attr("src", champs.items[i].abilities[1].img);
	champCard.table.ability[2].img.attr("src", champs.items[i].abilities[2].img);
	champCard.table.ability[3].img.attr("src", champs.items[i].abilities[3].img);
	champCard.table.ability[4].img.attr("src", champs.items[i].abilities[4].img);

	champCard.table.ability[0].name.text(champs.items[i].abilities[0].name);
	champCard.table.ability[1].name.text(champs.items[i].abilities[1].name);
	champCard.table.ability[2].name.text(champs.items[i].abilities[2].name);
	champCard.table.ability[3].name.text(champs.items[i].abilities[3].name);
	champCard.table.ability[4].name.text(champs.items[i].abilities[4].name);

	// TABLE TEXT
	champCard.table.col[1].row[0].text(champs.items[i].lanes.replaceAll(" ", ", "));
	champCard.table.col[1].row[1].text((champs.items[i].tags+"").replaceAll(",", ", "));
	champCard.table.col[1].row[2].text(champs.items[i].rangeType + " (" + champs.items[i].attackRange + ")");
	champCard.table.col[1].row[3].text(champs.items[i].resource);
	champCard.table.col[1].row[4].text(champs.items[i].region + ", " + champs.items[i].species);
	champCard.table.col[2].row[0].text(champs.items[i].releasePatch + " (" + champs.items[i].releaseDate + ")");

	// RATINGS
	champCard.table.ratings["damage"].attr("data-value", champs.items[i].ratings.damage);
	champCard.table.ratings["toughness"].attr("data-value", champs.items[i].ratings.toughness);
	champCard.table.ratings["control"].attr("data-value", champs.items[i].ratings.control);
	champCard.table.ratings["mobility"].attr("data-value", champs.items[i].ratings.mobility);
	champCard.table.ratings["utility"].attr("data-value", champs.items[i].ratings.utility);

	champCard.table.ratings["difficulty"].attr("data-value", champs.items[i].ratings.difficulty);
	champCard.table.ratings["style"].icons.attr("data-majority", champs.items[i].ratings.style < 50 ? "attack" : "spell");
	champCard.table.ratings["style"].bar.css("width", champs.items[i].ratings.style + "%");

	champCard.table.ratings["damageBreakdown"].magic.css("width", champs.items[i].ratings.damageBreakdown.magic + "%");
	champCard.table.ratings["damageBreakdown"].physical.css("width", champs.items[i].ratings.damageBreakdown.physical + "%");
	champCard.table.ratings["damageBreakdown"].true_.css("width", champs.items[i].ratings.damageBreakdown.true_ + "%");

	// ICONS
	champCard.table.icons["region"].attr("src", "assets/"+champs.items[i].region.replaceAll(" ", "_")+".png");
	champCard.table.icons["rangeType"].attr("src", "assets/"+champs.items[i].rangeType+".png");

	let lane = champs.items[i].lanes.split(" ")[0];
	champCard.table.icons["lane"]["Top"].addClass("hide");
	champCard.table.icons["lane"]["Jungle"].addClass("hide");
	champCard.table.icons["lane"]["Middle"].addClass("hide");
	champCard.table.icons["lane"]["Bottom"].addClass("hide");
	champCard.table.icons["lane"]["Support"].addClass("hide");
	champCard.table.icons["lane"][lane].removeClass("hide");

	let role = champs.items[i].tags[0];
	champCard.table.icons["role"]["Tank"].addClass("hide");
	champCard.table.icons["role"]["Fighter"].addClass("hide");
	champCard.table.icons["role"]["Assassin"].addClass("hide");
	champCard.table.icons["role"]["Mage"].addClass("hide");
	champCard.table.icons["role"]["Marksman"].addClass("hide");
	champCard.table.icons["role"]["Support"].addClass("hide");
	champCard.table.icons["role"][role].removeClass("hide");

	switch (champs.items[i].resource) {
		default:
		case "None": champCard.table.icons["resource"].attr("src", "assets/placeholder.png"); break;
		case "Mana": champCard.table.icons["resource"].attr("src", "assets/mana.png"); break;
		case "Energy": champCard.table.icons["resource"].attr("src", "assets/energy.png"); break;
		case "Heat": champCard.table.icons["resource"].attr("src", "assets/heat.png"); break;
		case "Shield":
		case "Blood Well":
		case "Flow": champCard.table.icons["resource"].attr("src", "assets/flow.png"); break;
		case "Health": champCard.table.icons["resource"].attr("src", "assets/health.png"); break;
		case "Courage":
		case "Crimson Rush":
		case "Ferocity":
		case "Grit":
		case "Rage":
		case "Fury": champCard.table.icons["resource"].attr("src", "assets/fury.png"); break;
	}

	// LINKS
	champCard.table.links["wiki"].attr("href", Champion.getUrlWikiAbilities(champs.items[i].name));
	champCard.table.links["universe"].attr("href", Champion.getUrlUniverse(champs.items[i].id));
	champCard.table.links["patchNotes"].attr("href", Champion.getUrlWikiPatchHistory(champs.items[i].name));
	champCard.table.links["spotlight"].attr("href", Champion.getUrlChampionSpotlight(champs.items[i].spotlightVideoID));

	highlightSearchText();

	// look if this champ has a tag matching currently searched tag
	if (search.tagId != null) {
		for (let a = 1; a < 6; a++) {
			for (let t in tags.champs[champs.items[i].name].tagArrays[a]) {
				if (search.tagId == tags.champs[champs.items[i].name].tagArrays[a][t]) {
					champCard.table.ability[a-1].row.addClass("highlight");
					champCard.activeAbility = a - 1;
				}
			}
		}
	} 

	champCardShowAbilityDetails(champCard.index, champCard.activeAbility);
}

/**
 * Copy ability name to clipboard on click.
 */
function bindChampCardActions() {
	//show ability
	$("#champcard .ability-wrapper").on("click", function() {
		champCard.activeAbility = $(this).index() - 1;
		champCardShowAbilityDetails(champCard.index, champCard.activeAbility);
	});
	// copy
	$("#champcard .ability-wrapper .action").on("click", function() {
		let i = $(this).parent().index() - 1;
		let s = "";
		s += champs.items[champs.i].abilities[i].name;
		switch (i) {
			case 0: s += " (P)"; break;
			case 1: s += " (Q)"; break;
			case 2: s += " (W)"; break;
			case 3: s += " (E)"; break;
			case 4: s += " (R)"; break;
		}

		navigator.clipboard.writeText(s);
		alert.show();
	});
}

function champCardShowAbilityDetails(champIndex, abilityIndex) {
	if (abilityIndex > 6) return;
	champCard.table.activeAbility.indicator.css("transform", `translateY(${36*abilityIndex + (abilityIndex*1)}px)`)
	champCard.table.activeAbility.description.html(champs.items[champIndex].abilities[abilityIndex].description);
	champCard.table.activeAbility.video.attr("src", champs.items[champIndex].abilities[abilityIndex].video);
	// disable video button if there is no video
	if (!champs.items[champIndex].abilities[abilityIndex].video || 
		champs.items[champIndex].abilities[abilityIndex].video == " ")
		champCard.table.activeAbility.videoBtn.addClass("disabled");
	else champCard.table.activeAbility.videoBtn.removeClass("disabled");
	// let s = "";
	// for (let t in tags.champs[champs.items[champIndex].name].tagArrays[abilityIndex+1])
		// s += Tags.getTagById(tags, tags.champs[champs.items[champIndex].name].tagArrays[abilityIndex+1][t]).name + ",";
	// if (s == "") s = "N/A";
	// champCard.table.activeAbility.tags.text(s);
	// champCard.table.activeAbility.scaling.text(champIndex + " " + abilityIndex);
}

/*
 * To be used after a search method, shows champCard of the first champion.
 */
function showChampCardForFirstVisibleChamp() {
	if (champs.visibleItems.length > 0) {
		// to allow to go to next champ directly, because first right arrow is 0 element,
		// since first champ's card will be open, we start i from 0
		champs.i = champs.visibleItems[0];
		champs.v = 0;
		updateChampCard(champs.i);
		champCard.show();
	} else champCard.hide();
}

function highlightSearchText() {
	highlightElement(champCard.title);

	for (let c = 0; c < 3; c++) {
		for (let r in champCard.table.col[c].row) {
			highlightElement(champCard.table.col[c].row[r])
		}
	}
}

function highlightElement(element) {
	let text = element.text().trim();
	let text_ = text.toLowerCase();

	if (search.text != null && search.text.length > 0 && 
		text_.includes(search.text)) {
		let a = text_.indexOf(search.text);
		let b = a + search.text.length;
		let span = text.substring(0, a) + "<span class='highlight'>" + text.substring(a, b) + "</span>" + text.substring(b, text.length);
		element.html(span);
	} else {
		if (element.has("span"))
			element.find("span").removeClass("highlight");
	}
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
					champCard.show(-11);
				}
			}
			// RIGHT
			else if (e.which == 39) {
				if (!searchState.hasFocus) {
					updateChampCard(champs.nextVisibleItem());
					champCard.show(-11);
				} else {
					if (search.element[0].value.length == search.element[0].selectionEnd) {
						search.element.blur();
						updateChampCard(champs.nextVisibleItem());
						champCard.show();
					}
				}
			}
			// UP
			else if (e.which == 38) {
				e.preventDefault();
				champCardShowAbilityDetails(champCard.index, champCard.prevAbility());
			}
			// DOWN
			else if (e.which == 40) {
				e.preventDefault();
				champCardShowAbilityDetails(champCard.index, champCard.nextAbility());
				// hide champCard 
				// if (!searchState.hasFocus) {
				// 	if (!champCard.card.hasClass("hide"))
				// 		e.preventDefault();
				// 	champCard.hide();
				// } else {
				// 	if (search.element[0].value.length == search.element[0].selectionEnd) {
				// 		e.preventDefault();
				// 		search.element.blur();
				// 		champCard.hide();
				// 	}
				// }
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
			e.target.classList.value == "sides-inner left" || 
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
	      		window.scrollY > lastKnownScrollPosition && !champCard.preventHide) { //only on scroll down
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
	champs.reset();
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
	$(champsPrinter.itemSelector).on("click", function(e) {

		champs.i = $(this).index() - 1;
		champs.findIndexInVisibleItems(champs.i);
		
		if (champs.i == champs.ii && !champCard.card.hasClass("hide")) {
			// hide card upon clicking on the same champ twice
			champCard.hide();
			champsPrinter.elements[champs.i+1].classList.remove("active");
		} else {
			updateChampCard(champs.i);
			champCard.show(this.getBoundingClientRect().bottom);
		}
	});
}

function updateSearchResultsCount(showAll) {
	const text = $("#search__count");
	if (showAll == null)
		text.text(champs.visibleItems.length);
	else text.text(champs.items.length);
}

function showAbilityKeysOnChamps() {
	for (let champ in champs.visibleItems) {
		for (let a = 1; a < 6; a++) {
			for (let t in tags.champs[champs.items[champs.visibleItems[champ]].name].tagArrays[a]) {
				if (search.tagId == tags.champs[champs.items[champs.visibleItems[champ]].name].tagArrays[a][t]) {
					let s = champsPrinter.elements.eq(champs.visibleItems[champ]+1).find(".key").text()
					switch (a - 1) {
						case 0: s += "P "; break;
						case 1: s += "Q "; break;
						case 2: s += "W "; break;
						case 3: s += "E "; break;
						case 4: s += "R "; break;
					}
					champsPrinter.elements.eq(champs.visibleItems[champ]+1).find(".key").text(s);
				}
			}
		}
	}
}

/* ---------------------------------------- SIDEBAR */

function initSidebar() {
	let sidebar = $("#sidebar");
	let sidebarOverlay = $("#sidebar__content-overlay");
	let htmlBody = $("html, body");

	// show sidebar
	$("#site-header__hamburger, #site-icon").on("click", function() {
		sidebar.addClass("show");
		sidebarOverlay.addClass("show");
		htmlBody.css("overflow", "hidden");
	});

	// hide sidebar upon clicking "empty area"
	sidebarOverlay.on("click", function() {
		sidebar.removeClass("show");
		sidebarOverlay.removeClass("show");
		htmlBody.css("overflow", "");
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

	for (let i in tags.menu) {
		
		let e;
		if (tags.menu[i].heading != null) { // HEADING
			e = filterPrinter.useTemplate(".sidebar-heading");
			e.text(tags.menu[i].heading);

		} else if (tags.menu[i].subheading != null) { // SUBHEADING
			e = filterPrinter.useTemplate(".sidebar-subheading");
			e.find("span").text(tags.menu[i].subheading);

		} else if (tags.menu[i].list != null) { // LIST
			e = ElementPrinter.startElement("ul", `class="section"`);
			for (let ii in tags.menu[i].list) {
				if (!Array.isArray(tags.menu[i].list[ii])) { // LIST ITEM
					// let li = filterPrinter.useTemplate("#filters-wrapper li");
					// li.find("a").attr("href", tags.menu[i].list[ii].link);
					// li.find("span").text(tags.menu[i].list[ii].text);
					// li.attr("title", tags.menu[i].list[ii].tooltip);
					// e += li[0].outerHTML;
					let li = filterPrinter.useTemplateAsString("#filters-wrapper li");
					li = li.replace("$text", tags.menu[i].list[ii].text);
					li = li.replace("$tooltip", tags.menu[i].list[ii].tooltip);
					e += li;
				} else { // NESTED LIST
					e += ElementPrinter.startElement("ul");
					for (let iii in tags.menu[i].list[ii]) { // NESTED LIST ITEM
						// let li = filterPrinter.useTemplate("#filters-wrapper li");
						// li.find("a").attr("href", tags.menu[i].list[ii][iii].link);
						// li.find("span").text(tags.menu[i].list[ii][iii].text);
						// li.attr("title", tags.menu[i].list[ii][iii].tooltip);
						// e += li[0].outerHTML;
						let li = filterPrinter.useTemplateAsString("#filters-wrapper li");
						li = li.replace("$text", tags.menu[i].list[ii][iii].text);
						li = li.replace("$tooltip", tags.menu[i].list[ii][iii].tooltip);
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
		return tags.menu[listIndex].list[itemIndex];
	else return tags.menu[listIndex].list[nestedListIndex][itemIndex];
}

/* ---------------------------------------- WINDOW FUNCTIONS */

function setCardWith() {
	const list = $("#champ-list__wrapper");
	const card = $("#champcard");
	card.css("width", (list[0].clientWidth + 21) + "px");
}

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

function scrollForOverflowingChamp(y) {
	if (y > window.innerHeight - 350) {
		window.scrollTo(0, window.scrollY + y - (window.innerHeight - 400));
	} else if (y < 100) {
		window.scrollTo(0, window.scrollY - (120 - y));
	}
}

/* ---------------------------------------- HELPER FUNCTIONS */

function getCurrentChamp() {
	console.log(champs.items[champCard.index]);
}

function getCurrentChampIndex() {
	console.log(champCard.index);
}

function splitAbilityToTwoLines(s) {
	// if (s.length > 23)
		// return s.replace(" / ", `\n`);
	return s;
}