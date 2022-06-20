class EditUiManager {

	/*
	 * for functions I tried using just: ddragon.getChamps, and run it as funcs[0][0](), however doing so messed up the respective objects' 'this' calls.
	 * changing objects' vars to static would solve the issue, but it would require lots of changes and complicate objects' code.
	 * Related Article? : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#binding_this_with_prototype_and_static_methods
	 */
	funcs = [
		["ddragon.getChamps", function() { ddragon.getChamps() }],
		["ddragon.removeExistingChamps", function() { ddragon.removeExistingChamps() }],
		["ddragon.getChampAbilities", function() { ddragon.getChampAbilities() }],
		["ddragon.getChampLoreInfo", function() { ddragon.getChampLoreInfo() }],
		["ddragon.getChampAbilityVideos", function() { ddragon.getChampAbilityVideos() }],
		["cdragon.getChampRatings", function() { cdragon.getChampRatings() }],
		["thirdparties.getGolChampUrls", function() { thirdparties.getGolChampUrls() }],
		["thirdparties.getChampDamageBreakdown", function() { thirdparties.getChampDamageBreakdown() }],
		["ChampionFunctions.addChamps", function() { ChampionFunctions.addChamps(); pageManager.populateChampsList(); }],
		["Open Spotlight Video Playlist", function() { window.open("https://www.youtube.com/playlist?list=PLbAFXJC0J5GaVjPNNw_i-oLNKc7bVQcFk", '_blank'); }],
	];

	selectedChampIndex = null;   //index within data array
	selectedChampElIndex = null; //index of the html list element
	selectedTagIndex = null;
	selectedTagElIndex = null;

	constructor() {
		//other populate functions are run after the JSON files are read.
		this.populateFunctions();
		this.checkCORS();
	}

	/****************************************** ETC **********************************************/

	checkCORS() {
		fetch("https://bahtyr.com")
			.then(() => $id("cors-indicator").classList.add("good"))
			.catch((error) => {});
	}

	toggleSection(id) {
		if (!id) return;
		$id(id).classList.toggle("hide");
	}

	/****************************************** PRINT LISTS **************************************/

	populateList(listId, array, onClick, onDblClick) {
		$id(listId).innerHTML = "";
		array.forEach((item, index) => {
			let li = document.createElement("li");
			let text = document.createTextNode(item);
			if (onClick) li.onclick = function(event) { onClick(index, item, event) };
			if (onDblClick) li.ondblclick = function() { onDblClick(index, item, event) };
			li.appendChild(text);
			$id(listId).appendChild(li);
		});
	}

	populateFunctions() {
		this.populateList("list-functions", this.funcs.map(fun => fun[0]), null, this.onClickFunc);
	}

	populateChampsList(search) {
		let arr;
		if (search == null)
			arr = champions.map(champ => champ.name);
		else if (typeof search == "string")
			arr = champions.filter(champ => champ.name.toLowerCase().includes(search.toLowerCase())).map(champ => champ.name);
		else if (Array.isArray(search))
			arr = champions.filter((champ, index) => search.includes(index)).map(champ => champ.name);

		this.populateList("list-champions", arr, this.onClickChamp);
	}

	populateTagList(search) {
		let arr;
		if (typeof search == "string")
			search = search.trim().toLowerCase();
		if (search != null)
			arr = tags.filter(tag => tag.name.toLowerCase().includes(search) || tag.id === search).map(tag => tag.id + " - " + tag.name);
		else arr = tags.map(tag => tag.id + " - " + tag.name);

		this.populateList("list-tags", arr, this.onClickTag);
	}

	populateSidebarList() {
		//
		// this.populateList("list-sidebar", sidebar.map(fun => fun[0]), null, this.onClickFunc);
	}

	populatePatchList(search) {
		let arr;
		if (!search)
			arr = patches;
		else if (typeof search == "string")
			arr = patches.filter(patch => patch.version.includes(search));

		this.populateList("list-patches", arr.map(patch => {
			let date = new Date(patch.start * 1000).toLocaleDateString("ko-KR", {year: "numeric", month: "2-digit", day: "2-digit"});
			return `V${patch.version} --- ${date}`;
		}), null, this.onDblClickPatch);

		if (!search)
			$query(`#list-patches li:nth-child(${PatchFunctions.getCurrentPatchIndex()+1})`).classList.add("highlight-patch");
	}

	/****************************************** SECTION CONTENT **********************************/

	populateChampData(i) {
		$id("champion-form").reset();
		$id("img-portrait").src = "";
		$id("img-ability-0").src = "";
		$id("img-ability-1").src = "";
		$id("img-ability-2").src = "";
		$id("img-ability-3").src = "";
		$id("img-ability-4").src = "";

		$id("idKebab").value = champions[i].ids.kebab;
		$id("idDdragon").value = champions[i].ids.ddragon;
		$id("idCdragon").value = champions[i].ids.cdragon;
		$id("idWiki").value = champions[i].ids.wiki;
		$id("idUniverse").value = champions[i].ids.universe;
		
		$id("img-portrait").src = champions[i].portrait;
		$id("name").value = champions[i].name;
		$id("title").value = champions[i].title;
		$id("portrait").value = champions[i].portrait;

		if (champions[i].lanes?.includes("Top")) $id("laneTop").checked = true;
		if (champions[i].lanes?.includes("Jun")) $id("laneJg").checked = true;
		if (champions[i].lanes?.includes("Mid")) $id("laneMid").checked = true;
		if (champions[i].lanes?.includes("Bot")) $id("laneBot").checked = true;
		if (champions[i].lanes?.includes("Sup")) $id("laneSup").checked = true;

		if (champions[i].tags?.includes("Fighter")) $id("roleFighter").checked = true;
		if (champions[i].tags?.includes("Tank")) $id("roleTank").checked = true;
		if (champions[i].tags?.includes("Assassin")) $id("roleAssassin").checked = true;
		if (champions[i].tags?.includes("Mage")) $id("roleMage").checked = true;
		if (champions[i].tags?.includes("Marksman")) $id("roleMarksman").checked = true;
		if (champions[i].tags?.includes("Support")) $id("roleSupport").checked = true;

		$id("resource").value = champions[i].resource;
		$id("attackRange").value = champions[i].attackRange;
		if (champions[i].rangeType?.includes("Ranged")) $id("rangeTypeRanged").checked = true;
		if (champions[i].rangeType?.includes("Melee")) $id("rangeTypeMelee").checked = true;

		$id("ratingDamage").value = champions[i].ratings?.damage;
		$id("ratingMobility").value = champions[i].ratings?.mobility;
		$id("ratingToughness").value = champions[i].ratings?.toughness;
		$id("ratingControl").value = champions[i].ratings?.control;
		$id("ratingUtility").value = champions[i].ratings?.utility;

		$id("difficulty").value = champions[i].ratings?.difficulty;
		$id("style").value = champions[i].ratings?.style;
		$id("dmgMagic").value = champions[i].ratings?.damageBreakdown?.magic ?? 0;
		$id("dmgPhysical").value = champions[i].ratings?.damageBreakdown?.physical ?? 0;
		$id("dmgTrue_").value = champions[i].ratings?.damageBreakdown?.true_ ?? 0;

		$id("releaseDate").value = champions[i].releaseDate ?? "";
		$id("releasePatch").value = champions[i].releasePatch ?? "";

		$id("region").value = champions[i].region ?? "";
		$id("species").value = champions[i].species ?? "";

		$id("spotlightVideoID").value = champions[i].spotlightVideoID ?? "";

		$id("img-ability-0").src = champions[i].abilities[0].img;
		$id("ability-0-name").value = champions[i].abilities[0].name;
		$id("ability-0-description").value = champions[i].abilities[0].description;
		$id("ability-0-img").value = champions[i].abilities[0].img;
		$id("ability-0-video").value = champions[i].abilities[0].video;
		
		$id("img-ability-1").src = champions[i].abilities[1].img;
		$id("ability-1-name").value = champions[i].abilities[1].name;
		$id("ability-1-description").value = champions[i].abilities[1].description;
		$id("ability-1-img").value = champions[i].abilities[1].img;
		$id("ability-1-video").value = champions[i].abilities[1].video;
		
		$id("img-ability-2").src = champions[i].abilities[2].img;
		$id("ability-2-name").value = champions[i].abilities[2].name;
		$id("ability-2-description").value = champions[i].abilities[2].description;
		$id("ability-2-img").value = champions[i].abilities[2].img;
		$id("ability-2-video").value = champions[i].abilities[2].video;
		
		$id("img-ability-3").src = champions[i].abilities[3].img;
		$id("ability-3-name").value = champions[i].abilities[3].name;
		$id("ability-3-description").value = champions[i].abilities[3].description;
		$id("ability-3-img").value = champions[i].abilities[3].img;
		$id("ability-3-video").value = champions[i].abilities[3].video;

		$id("img-ability-4").src = champions[i].abilities[4].img;
		$id("ability-4-name").value = champions[i].abilities[4].name;
		$id("ability-4-description").value = champions[i].abilities[4].description;
		$id("ability-4-img").value = champions[i].abilities[4].img;
		$id("ability-4-video").value = champions[i].abilities[4].video;

		pageManager.populateChampTags();
	}

	populateChampTags() {
		$id("champtags-0").innerHTML = "";
		$id("champtags-1").innerHTML = "";
		$id("champtags-2").innerHTML = "";
		$id("champtags-3").innerHTML = "";
		$id("champtags-4").innerHTML = "";
		$id("champtags-5").innerHTML = "";
		champions[pageManager.selectedChampIndex].tagArrays.forEach((arr, index) => {
			this.populateList(`champtags-${index}`, arr.map(id => tags.find(tag => tag.id == id)?.name), this.champOnClickTag, this.champOnDblClickTag);
		});
	}

	saveChampData() {
		let form = $id("champion-form");
		let i = this.selectedChampIndex;
		// let champ = {ids: {}, abilities: [{},{},{},{},{}], ratings: {damageBreakdown: {}}};

		champions[i].ids.kebab = $id("idKebab").value;
		champions[i].ids.ddragon = $id("idDdragon").value;
		champions[i].ids.cdragon = parseInt($id("idCdragon").value);
		champions[i].ids.wiki = $id("idWiki").value;
		champions[i].ids.universe = $id("idUniverse").value;
		
		champions[i].portrait = $id("img-portrait").src;
		champions[i].name = $id("name").value;
		champions[i].title = $id("title").value;
		champions[i].portrait = $id("portrait").value;

		champions[i].lanes = "";
		if ($id("laneTop").checked) champions[i].lanes += "Top ";
		if ($id("laneJg").checked)  champions[i].lanes += "Jungle ";
		if ($id("laneMid").checked) champions[i].lanes += "Middle ";
		if ($id("laneBot").checked) champions[i].lanes += "Bottom ";
		if ($id("laneSup").checked) champions[i].lanes += "Support ";
		champions[i].lanes = champions[i].lanes.trim();

		champions[i].tags = [];
		if ($id("roleFighter").checked)  champions[i].tags.push("Fighter");
		if ($id("roleTank").checked)   champions[i].tags.push("Tank");
		if ($id("roleAssassin").checked) champions[i].tags.push("Assassin");
		if ($id("roleMage").checked)     champions[i].tags.push("Mage");
		if ($id("roleMarksman").checked) champions[i].tags.push("Marksman");
		if ($id("roleSupport").checked)  champions[i].tags.push("Support");

		champions[i].resource = $id("resource").value;
		champions[i].attackRange = parseInt($id("attackRange").value);
		if ($id("rangeTypeRanged").checked) champions[i].rangeType = "Ranged";
		if ($id("rangeTypeMelee").checked)  champions[i].rangeType = "Melee";

		champions[i].ratings.damage    = parseInt($id("ratingDamage").value);
		champions[i].ratings.mobility  = parseInt($id("ratingMobility").value);
		champions[i].ratings.toughness = parseInt($id("ratingToughness").value);
		champions[i].ratings.control   = parseInt($id("ratingControl").value);
		champions[i].ratings.utility   = parseInt($id("ratingUtility").value);

		champions[i].ratings.difficulty = parseInt($id("difficulty").value);
		champions[i].ratings.style = parseFloat($id("style").value);
		if (champions[i].ratings.damageBreakdown == null)
			champions[i].ratings.damageBreakdown = {};
		champions[i].ratings.damageBreakdown.magic    = parseFloat($id("dmgMagic").value);
		champions[i].ratings.damageBreakdown.physical = parseFloat($id("dmgPhysical").value);
		champions[i].ratings.damageBreakdown.true_    = parseFloat($id("dmgTrue_").value);

		champions[i].releaseDate = $id("releaseDate").value;
		champions[i].releasePatch = $id("releasePatch").value;

		champions[i].region = $id("region").value;
		champions[i].species = $id("species").value;

		let _spotlight = this.champAutoRemoveYoutubeLink($id("spotlightVideoID").value)
		champions[i].spotlightVideoID = _spotlight;
		$id("spotlightVideoID").value = _spotlight;

		champions[i].abilities[0].img = $id("img-ability-0").src;
		champions[i].abilities[0].name = $id("ability-0-name").value;
		champions[i].abilities[0].description = $id("ability-0-description").value;
		champions[i].abilities[0].img = $id("ability-0-img").value;
		champions[i].abilities[0].video = $id("ability-0-video").value;
		
		champions[i].abilities[1].img = $id("img-ability-1").src;
		champions[i].abilities[1].name = $id("ability-1-name").value;
		champions[i].abilities[1].description = $id("ability-1-description").value;
		champions[i].abilities[1].img = $id("ability-1-img").value;
		champions[i].abilities[1].video = $id("ability-1-video").value;
		
		champions[i].abilities[2].img = $id("img-ability-2").src;
		champions[i].abilities[2].name = $id("ability-2-name").value;
		champions[i].abilities[2].description = $id("ability-2-description").value;
		champions[i].abilities[2].img = $id("ability-2-img").value;
		champions[i].abilities[2].video = $id("ability-2-video").value;
		
		champions[i].abilities[3].img = $id("img-ability-3").src;
		champions[i].abilities[3].name = $id("ability-3-name").value;
		champions[i].abilities[3].description = $id("ability-3-description").value;
		champions[i].abilities[3].img = $id("ability-3-img").value;
		champions[i].abilities[3].video = $id("ability-3-video").value;

		champions[i].abilities[4].img = $id("img-ability-4").src;
		champions[i].abilities[4].name = $id("ability-4-name").value;
		champions[i].abilities[4].description = $id("ability-4-description").value;
		champions[i].abilities[4].img = $id("ability-4-img").value;
		champions[i].abilities[4].video = $id("ability-4-video").value;

		if (champions[i].tagArrays == null)
			champions[i].tagArrays = [[],[],[],[],[],[]];

		pageManager.champAutoAddAttackRangeTag();
		pageManager.populateChampTags()
		pageManager.highlightExport("champions");
		log(`Saved ${i}:${champions[i].name}.`);
	}

	champAutoAddAttackRangeTag() {
		let t;
		let current = tags.findIndex(tag => tag.name.toLowerCase().includes("melee"));
		let remove = tags.findIndex(tag => tag.name.toLowerCase().includes("ranged"));

		if (champions[this.selectedChampIndex].rangeType == "Ranged") {
			t = current;
			current = remove;
			remove  = t;
		}

		TagFunctions.removeFromChamp(this.selectedChampIndex, 0, null, remove);
		TagFunctions.addToChamp(current, this.selectedChampIndex, 0);
	}

	champAutoRemoveYoutubeLink(s) {
		return !s.includes("http") ? s : s.split("=")[1].split("&")[0];
	}

	/****************************************** ONCLICK ******************************************/

	/******************** save / export ********/

	onClickExport(id) {
		// note: pointerEvetns of export without highlight is disabled through css
		$id(id).classList.remove("highlight");
		switch (id) {
			case "export-champions": updateChamps(); break;
			case "export-tags":      updateTags(); break;
		}
	}

	highlightExport(sectionName) {
		$id("export-"+sectionName).classList.add("highlight");
	}

	/******************** list *****************/

	onClickFunc(i) {
		pageManager.funcs[i][1]();
	}

	onClickChamp(elIndex) {
		let champName = $query(`#list-champions li:nth-child(${elIndex+1})`).textContent;
		pageManager.selectedChampElIndex = elIndex;
		pageManager.selectedChampIndex = champions.findIndex(champ => champ.name == champName);
		pageManager.populateChampData(pageManager.selectedChampIndex);
	}

	onClickTag(elIndex) {
		let text = $query(`#list-tags li:nth-child(${elIndex+1})`).textContent;
		let id = parseInt(text.split(" - ")[0]);
		let i = tags.findIndex(tag => tag.id == id);
		pageManager.selectedTagElIndex = elIndex;
		pageManager.selectedTagIndex = i;
		$id("input__tag-id").value = tags[i].id;
		$id("input__tag-name").value = tags[i].name;
	}

	onClickPatch() { }

	onDblClickPatch(elIndex, elText) {
		let patch = elText.split(" ")[0].substring(1);
		let i = patches.findIndex(p => p.version == patch);
		if (i > -1) window.open(patches[i].link, '_blank');
	}

	/******************** search ***************/

	onSearch(obj) {
		switch (obj.id) {
			case "search-champions": this.populateChampsList(obj.value); break;
			case "search-tags": this.populateTagList(obj.value); break;
			case "search-patches": this.populatePatchList(obj.value); break;
		}
	}

	clearSearch(id) {
		$id(id).value = "";
		switch (id) {
			case "search-champions": this.populateChampsList(); break;
			case "search-tags": this.populateTagList(); break;
			case "search-patches": this.populatePatchList(); break;
		}
	}

	/******************** champ's tags *********/

	champOnClickTag(elIndex, elText, event) {
		let tagName = elText;
		$id("search-tags").value = tagName;
		pageManager.populateTagList(tagName);
		pageManager.onClickTag(0);
	}

	champOnDblClickTag(elIndex, elText, event) {
		let abilityIndex = parseInt(event.path[1].id.split("-")[1]);
		TagFunctions.removeFromChamp(pageManager.selectedChampIndex, abilityIndex, elIndex)
		pageManager.populateChampTags();
		pageManager.highlightExport("champions");
	}

	/******************** tags *****************/

	tagOnClickShowChamps() {
		this.populateChampsList(tags[this.selectedTagIndex].champIndexes);
	}

	tagOnClickClear() {
		this.selectedTagIndex = null;
		$id("input__tag-id").value = "";
		$id("input__tag-name").value = "";
	}

	tagOnClickNew() {
		if ($id("input__tag-name").value == "") return;
		let name = $id("input__tag-name").value;
		TagFunctions.createTag(name);
		this.populateTagList();
		$id("list-tags").scrollTop = $id("list-tags").scrollHeight;
		pageManager.highlightExport("tags");
	}

	tagOnClickSave() {
		let i = this.selectedTagIndex;
		let name = $id("input__tag-name").value;
		let id = parseInt($id("input__tag-id").value);
		TagFunctions.renameTag(i, id, name);
		$query(`#list-tags li:nth-child(${this.selectedTagElIndex+1})`).textContent = id + " - " + name;
		pageManager.highlightExport("tags");
	}

	tagOnClickAddToAbility(ability) {
		if (pageManager.selectedChampIndex == null) return;
		let tagId = tags[pageManager.selectedTagIndex].id;
		TagFunctions.addToChamp(tagId, pageManager.selectedChampIndex, ability)
		pageManager.populateChampTags();
		pageManager.highlightExport("champions");
	}
}
