var champions = [];
var tags      = [];
var menu      = [];
var patches   = {};
var champlist = new ChampListManager;
var champcard = new ChampCardManager;
var sidebar   = new SidebarManager;
var sort      = {};
// var search = {}; @search.js

fetch("data/champions.json").then(data => data.json()).then(json => {
	champions = json.map(item => ChampionFunctions.transfer(item));
	champlist.print();
	matchChampionsAndTags();;
});

fetch("data/sidebar.json").then(data => data.json()).then(json => {
	menu = json;
	sidebar.print();
});

fetch("data/tags.json").then(data => data.json()).then(json => {
	tags = json;
	matchChampionsAndTags();
});

fetch("data/patches.json").then(data => data.json()).then(json => {
	patches = json;
	printPatchInfo();
});

/* wait for both champions & tags to be initiated, then run only once */
let champTagsMatched = false;
function matchChampionsAndTags() {
	if (champTagsMatched) return;
	if (champions && champions.length == 0) return;
	if (tags      && tags.length == 0) return;
	champTagsMatched = true;

	/* put champions' tagArrays to each tag as championIndexes */
	tags.forEach(tag => champions.forEach((champ, index) => {
		champ.tagArrays.forEach(t => {
			if (t.includes(tag.id)) tag.champIndexes.push(index);
		});
	}));
}

/* find current patch and print */
function printPatchInfo() {
	/**
	 * 1. start from the last and check if the date is bigger than today
	 * 2. current + 1 is next patch, unless it is the last known patch
	 * 3. if next == current, we reached to the end of known pacthes, don't show next patch date
	 */
	let today = Date.now();
	let current = patches.length - 1;
	while (patches[current].start * 1000 > today) current--;

	let next = current == patches.length ? current : current + 1;

	let nextPatchDate = new Date(patches[next].start * 1000).toLocaleDateString("en-US", {month: "short", weekday: "short", day: "numeric"});
	let tooltip = $class("patch-version-tooltip")[0];
	$id("patch-version").textContent = "V" + patches[current].version;
	tooltip.children[0].textContent = "V" + patches[current].version;
	tooltip.children[1].textContent = "Next Patch: " + (next == current ? "N/A" : nextPatchDate);
	tooltip.children[2].setAttribute("href", patches[current].link);
}

/*************************************************************************************************/

sort.reset = function () {
	/**
	 * is used before champlist.hideAllExcept()
	 * since we only keep "champ index" on our tag list, we have to revert the list before showing results
	 * otherwise "champ index" taglist and the champ list indexes will not match
	 */
	if ($id("sort").value != "abc") {
		$id("sort").value =  "abc";
		$id("sort").dispatchEvent(new Event('change'));
	}
}