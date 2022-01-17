var ChampionFunctions = {
	searchableText: function() {
		return (`${this.name} ${this.title} ${this.lanes} ${this.rangeType} ${this.attackRange}`
			+ ` ${this.resource} ${this.releaseDate} ${this.releasePatch}`
			+ ` ${this.region} ${this.species} ${this.lanes} ${this.tags[0]} ${(this.tags.length == 2 ? this.tags[1] : "")}`
			+ ` ${this.abilities[0].name} ${this.abilities[1].name} ${this.abilities[2].name}`
			+ ` ${this.abilities[3].name} ${this.abilities[4].name}`).toLowerCase();
	},
	getUrlWikiLore() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}`; },
	getUrlWikiAbilities() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}/LoL#Abilities`; },
	getUrlWikiPatchHistory() { return `https://leagueoflegends.fandom.com/wiki/${this.ids.wiki}/LoL/Patch_history`; },
	getUrlUniverse() { return `https://universe.leagueoflegends.com/en_SG/champion/${this.ids.ddragon}/`;; },
	getUrlChampionSpotlight() { return `https://www.youtube.com/watch?v=${this.spotlightVideoID}`; },
	transfer: function(obj) {
		obj.searchableText = this.searchableText;
		obj.getUrlWikiLore = this.getUrlWikiLore;
		obj.getUrlWikiAbilities = this.getUrlWikiAbilities;
		obj.getUrlWikiPatchHistory = this.getUrlWikiPatchHistory;
		obj.getUrlUniverse = this.getUrlUniverse;
		obj.getUrlChampionSpotlight = this.getUrlChampionSpotlight;
		return obj;
	},

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
	}
}