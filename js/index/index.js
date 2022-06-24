var champions = [];
var tags      = [];
var menu      = [];
var patches   = {};
var champlist = new ChampListManager;
var champcard = new ChampCardManager;
var sidebar   = new SidebarManager;
var filters   = new FiltersManager;
var sort      = new SortManager;
// var search = {}; @search.js

var modalHelp = new Modal("modal-help");

fetch("data/champions.json").then(data => data.json()).then(json => {
	champions = json.map(item => ChampionFunctions.transfer(item));
	champlist.print();
	TagFunctions.initIndexes();
	autocompleteChampNames.init();
});

fetch("data/sidebar.json").then(data => data.json()).then(json => {
	menu = json;
	sidebar.print();
});

fetch("data/tags.json").then(data => data.json()).then(json => {
	tags = json;
	TagFunctions.initIndexes();
});

fetch("data/patches.json").then(data => data.json()).then(json => {
	patches = json;
	printPatchInfo();
});


/* find current patch and print */
function printPatchInfo() {
	/**
	 * 1. start from the last and check if the date is bigger than today
	 * 2. current + 1 is next patch, unless it is the last known patch
	 * 3. if next == current, we reached to the end of known pacthes, don't show next patch date
	 */
	let current = PatchFunctions.getCurrentPatchIndex();
	let next = current == patches.length ? current : current + 1;
	let nextPatchDate = new Date(patches[next].start).toLocaleDateString("en-US", {month: "short", weekday: "short", day: "numeric"});

	$id("patch-version").textContent = "Patch " + patches[current].version;
	$id("patch-notes-current").children[0].textContent = "Patch " + patches[current].version + " Notes";
	$id("patch-notes-current").setAttribute("href", patches[current].link);

	if (next === current) $id("patch-notes-next").setAttribute("display", "none");
	if (next === current) return;

	// enable the link one day before patch is released
	if (PatchFunctions.hoursDiff(next, 24))
		$id("patch-notes-next").classList.remove("disabled");
	$id("next-patch-date").textContent = nextPatchDate;
	$id("patch-notes-next").children[0].textContent = "Patch " + patches[next].version + " Notes";
	$id("patch-notes-next").setAttribute("href", patches[next].link);
}