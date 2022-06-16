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
		["ddragon.transferChamps", function() { ddragon.transferChamps() }],
	];

	selectedChampIndex = null;
	selectedTagIndex = null;

	constructor() {}

	/****************************************** PRINT LISTS **************************************/

	populateList(listId, array, onClick, onDblClick) {
		$id(listId).innerHTML = "";
		array.forEach((item, index) => {
			let li = document.createElement("li");
			let text = document.createTextNode(item);
			if (onClick) li.onclick = function() { onClick(index) };
			if (onDblClick) li.ondblclick = function() { onDblClick(index) };
			li.appendChild(text);
			$id(listId).appendChild(li);
		});
	}

	populateChampsList() {
		this.populateList("list-champs", champions.map(champ => champ.name), this.onClickChamp);
	}

	populateTagList() {
		this.populateList("list-tags", tags.map(tag => tag.id + " - " + tag.name), this.onClickTag);
	}

	populateFunctions() {
		this.populateList("list-functions", this.funcs.map(fun => fun[0]), null, this.onClickFunc);
	}

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
		if (champions[i].tags?.includes("Bruiser")) $id("roleBuiser").checked = true;
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
	}

	/****************************************** READ *********************************************/

	readChampData() {
		let form = $id("champion-form");
		let i = this.selectedChampIndex;
		// let champ = {ids: {}, abilities: [{},{},{},{},{}], ratings: {damageBreakdown: {}}};

		champions[i].ids.kebab = $id("idKebab").value;
		champions[i].ids.ddragon = $id("idDdragon").value;
		champions[i].ids.cdragon = $id("idCdragon").value;
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
		if ($id("roleBuiser").checked)   champions[i].tags.push("Bruiser");
		if ($id("roleAssassin").checked) champions[i].tags.push("Assassin");
		if ($id("roleMage").checked)     champions[i].tags.push("Mage");
		if ($id("roleMarksman").checked) champions[i].tags.push("Marksman");
		if ($id("roleSupport").checked)  champions[i].tags.push("Support");

		champions[i].resource = $id("resource").value;
		champions[i].attackRange = $id("attackRange").value;
		if ($id("rangeTypeRanged").checked) champions[i].rangeType = "Ranged";
		if ($id("rangeTypeMelee").checked)  champions[i].rangeType = "Melee";

		champions[i].ratings.damage = $id("ratingDamage").value;
		champions[i].ratings.mobility = $id("ratingMobility").value;
		champions[i].ratings.toughness = $id("ratingToughness").value;
		champions[i].ratings.control = $id("ratingControl").value;
		champions[i].ratings.utility = $id("ratingUtility").value;

		champions[i].ratings.difficulty = $id("difficulty").value;
		champions[i].ratings.style = $id("style").value;
		if (champions[i].ratings.damageBreakdown == null)
			champions[i].ratings.damageBreakdown = {};
		champions[i].ratings.damageBreakdown.magic = $id("dmgMagic").value;
		champions[i].ratings.damageBreakdown.physical = $id("dmgPhysical").value;
		champions[i].ratings.damageBreakdown.true_ = $id("dmgTrue_").value;

		champions[i].releaseDate = $id("releaseDate").value;
		champions[i].releasePatch = $id("releasePatch").value;

		champions[i].region = $id("region").value;
		champions[i].species = $id("species").value;

		champions[i].spotlightVideoID = $id("spotlightVideoID").value;

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

		log(`Saved ${i}:${champions[i].name}.`);
	}


	/****************************************** ONCLICK ******************************************/

	onClickFunc(i) {
		pageManager.funcs[i][1]();
	}

	onClickChamp(i) {
		pageManager.selectedChampIndex = i;
		pageManager.populateChampData(i);
	}

	onClickTag(i) {
		pageManager.selectedTagIndex = i;
		$id("input__tag-id").value = tags[i].id;
		$id("input__tag-name").value = tags[i].name;
	}
}
