var champions = [];
var tags      = [];
var menu      = [];
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