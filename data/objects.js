var ChampionFunctions = {

	/**
	 * Champions are not created from scratch, ddragon provides majority of the data so we prefer editing ddragon.champions.
	 * then we run cdragon and thirdParties scripts add a few more data there,
	 * finally here we add the new champ to the main champions array.
	 */
	addChamps: function() {
		ddragon.champions.forEach(champ => this.initMissingFields(champ));
		champions.push(...ddragon.champions);
		champions.sort(ChampionFunctions.compareNames);
		log(`${ddragon.champions.length} are added to champions list.`);
	},

	/** init fields to not get error when making checks */
	initMissingFields: function(obj) {
		// releaseDate, releasePatch, region, species, spotlightVideoID
		if (obj.tagArrays == null)               obj.tagArrays = [[],[],[],[],[],[]];
		if (obj.ratings == null)                 obj.ratings = {};
		if (obj.ratings.damageBreakdown == null) obj.ratings.damageBreakdown = {};
		return obj;
	},

	/******************** SEARCH & CHAMPCARD ***/

	searchableText: function() {
		return (`${this.name.replace(/[^\w\s]/g, "").replace(/[ ]+/g, ' ')} ${this.title} ${this.lanes} ${this.rangeType} ${this.attackRange}`
			+ ` ${this.resource} ${this.releaseDate} ${this.releasePatch}`
			+ ` ${this.region} ${this.species} ${this.lanes} ${this.tags[0]} ${(this.tags.length == 2 ? this.tags[1] : "")}`
			+ ` ${this.abilities[0].name} ${this.abilities[1].name} ${this.abilities[2].name}`
			+ ` ${this.abilities[3].name} ${this.abilities[4].name}`).toLowerCase();
	},
	getUrlWikiLore() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}`; },
	getUrlWikiAbilities() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}/LoL#Abilities`; },
	getUrlWikiPatchHistory() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}/LoL/Patch_history`; },
	getUrlUniverse() { return `https://universe.leagueoflegends.com/en_SG/champion/${this.ids.universe}/`; },
	getUrlChampionSpotlight() { return `https://www.youtube.com/watch?v=${this.spotlightVideoID}`; },
	/** Add these functions to each "champion object" */
	transfer: function(obj) {
		obj.searchableText = this.searchableText;
		obj.getUrlWikiLore = this.getUrlWikiLore;
		obj.getUrlWikiAbilities = this.getUrlWikiAbilities;
		obj.getUrlWikiPatchHistory = this.getUrlWikiPatchHistory;
		obj.getUrlUniverse = this.getUrlUniverse;
		obj.getUrlChampionSpotlight = this.getUrlChampionSpotlight;
		return obj;
	},

	/******************** ID *******************/

	/** deprecated */
	generateIdPascalCase: function(str) {
		return str
			.replace(new RegExp(/[-_]+/, 'g'), ' ')
			.replace(new RegExp(/[^\w\s]/, 'g'), '')
			.replace(
				new RegExp(/\s+(.)(\w*)/, 'g'),
				($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
			)
			.replace(new RegExp(/\w/), s => s.toUpperCase());
	},
	generateIdKebabCase: function(str) {
		return str
			.replace(/[^\w]/g, '-')//replace all non characters with -
			.replace(/[-]+/g, '-')//replace multiple - (--) with one -
			.toLowerCase();
	},
	generateIdWikiCase: function(str) {
		return str.replace(/[\s]/g, '_');
	},

	/******************** SORT *****************/

	compareNames(a, b) {
		if (a.name < b.name) return -1;
		else if (a.name > b.name) return 1;
		return 0;
	},
	compareReleaseDates(a, b) {
		let a_ = new Date(a.releaseDate).getTime();
		let b_ = new Date(b.releaseDate).getTime();
		if (a_ > b_) return -1;
		else if (a_ < b_) return 1;
		return ChampionFunctions.compareNames(a, b);
	},
}

var TagFunctions = {

	/**
	 * matches champions' indexes with tags, (adds a champ's index to a tag's champIndexes[])
	 * wait for both champions & tags to be initiated, then run only once
	 * */
	isInitDone: false,
	initIndexes: function() {
		if (this.isInitDone) return;
		if (champions && champions.length == 0) return;
		if (tags      && tags.length == 0) return;
		this.isInitDone = true;

		/* put champions' tagArrays to each tag as championIndexes */
		tags.forEach(tag => champions.forEach((champ, index) => {
			champ.tagArrays.forEach(t => {
				if (t.includes(tag.id)) tag.champIndexes.push(index);
			});
		}));
	},

	/******************** CRUD *****************/

	createTag: function(name) {
		let newId = tags[tags.length - 1].id + 1;
		tags.push({id: newId, name: name, champIndexes: []});
		return newId;
	},

	deleteTag: function() {}, //TODO

	renameTag: function(index, name, id) {
		if (index != null) return;
		if (name != null)  tags[i].name = name
		if (id != null)    tags[i].id = id;
	},

	addToChamp: function(tagId, champIndex, champAbilityIndex) {
		if (champions[champIndex].tagArrays[champAbilityIndex].includes(tagId)) return;
		    champions[champIndex].tagArrays[champAbilityIndex].push(tagId);
	},

	removeFromChamp: function(tagId, champIndex, champAbilityIndex) {} //TODO
}