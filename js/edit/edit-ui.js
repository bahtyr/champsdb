class EditUiManager {

	/*
	 * for functions I tried using just: ddragon.getChamps, and run it as funcs[0][0](), however doing so messed up the respective objects' 'this' calls.
	 * changing objects' vars to static would solve the issue, but it would require lots of changes and complicate objects' code.
	 * Related Article? : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#binding_this_with_prototype_and_static_methods
	 */
	funcs = [
		["ddragon.getChamps", function() { ddragon.getChamps() }],
		["ddragon.getChampAbilities", function() { ddragon.getChampAbilities() }],
		["ddragon.getChampLoreInfo", function() { ddragon.getChampLoreInfo() }],
		["ddragon.getChampAbilityVideos", function() { ddragon.getChampAbilityVideos() }],
		["cdragon.getChampRatings", function() { cdragon.getChampRatings() }],
		["thirdparties.getGolChampUrls", function() { thirdparties.getGolChampUrls() }],
		["thirdparties.getChampDamageBreakdown", function() { thirdparties.getChampDamageBreakdown() }]
	];

	selectedChampIndex = null;
	selectedTagIndex = null;

	constructor() {}

	/****************************************** PRINT LISTS **************************************/

	populateList(listId, array, onClick, onDblClick) {
		array.forEach((item, index) => {
			let li = document.createElement("li");
			let text = document.createTextNode(item);
			if (onClick) li.onclick = function() { onClick(index) };
			if (onDblClick) li.ondblclick = function() { onDblClick(index) };
			li.appendChild(text);
			document.getElementById(listId).appendChild(li);
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

		$id("idPascal").value = champions[i].ids.pascal;
		$id("idKebab").value = champions[i].ids.kebab;
		$id("idDdragon").value = champions[i].ids.ddragon;
		$id("idCdragon").value = champions[i].ids.cdragon;
		$id("idWiki").value = champions[i].ids.wiki;
		$id("idUniverse").value = champions[i].ids.universe;
		
		$id("img-portrait").src = champions[i].portrait;
		$id("name").value = champions[i].name;
		$id("title").value = champions[i].title;
		$id("portrait").value = champions[i].portrait;

		if (champions[i].lanes.includes("Top")) $id("laneTop").checked = true;
		if (champions[i].lanes.includes("Jun")) $id("laneJg").checked = true;
		if (champions[i].lanes.includes("Mid")) $id("laneMid").checked = true;
		if (champions[i].lanes.includes("Bot")) $id("laneBot").checked = true;
		if (champions[i].lanes.includes("Sup")) $id("laneSup").checked = true;

		if (champions[i].tags.includes("Fighter")) $id("roleFighter").checked = true;
		if (champions[i].tags.includes("Bruiser")) $id("roleBuiser").checked = true;
		if (champions[i].tags.includes("Assassin")) $id("roleAssassin").checked = true;
		if (champions[i].tags.includes("Mage")) $id("roleMage").checked = true;
		if (champions[i].tags.includes("Marksman")) $id("roleMarksman").checked = true;
		if (champions[i].tags.includes("Support")) $id("roleSupport").checked = true;

		$id("resource").value = champions[i].resource;
		$id("attackRange").value = champions[i].attackRange;
		if (champions[i].rangeType.includes("Ranged")) $id("rangeTypeRanged").checked = true;
		if (champions[i].rangeType.includes("Melee")) $id("rangeTypeMelee").checked = true;

		$id("ratingDamage").value = champions[i].ratings.damage;
		$id("ratingMobility").value = champions[i].ratings.mobility;
		$id("ratingToughness").value = champions[i].ratings.toughness;
		$id("ratingControl").value = champions[i].ratings.control;
		$id("ratingUtility").value = champions[i].ratings.utility;

		$id("difficulty").value = champions[i].ratings.difficulty;
		$id("style").value = champions[i].ratings.style;
		$id("dmgMagic").value = champions[i].ratings.damageBreakdown.magic;
		$id("dmgPhysical").value = champions[i].ratings.damageBreakdown.physical;
		$id("dmgTrue_").value = champions[i].ratings.damageBreakdown.true_;

		$id("releaseDate").value = champions[i].releaseDate;
		$id("releasePatch").value = champions[i].releasePatch;

		$id("region").value = champions[i].region;
		$id("species").value = champions[i].species;

		$id("spotlightVideoID").value = champions[i].spotlightVideoID;

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

	/****************************************** ONCLICK ******************************************/

	onClickFunc(i) {
		pageManager.funcs[i][1]();
	}

	onClickChamp(i) {
		pageManager.populateChampData(i);
	}

	onClickTag(i) {
		pageManager.selectedTagIndex = i;
		$id("input__tag-id").value = tags[i].id;
		$id("input__tag-name").value = tags[i].name;
	}

}
