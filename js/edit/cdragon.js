class CDragon {

	//champions = ddragon.champions; //use this instead

	//URLS
	URL_DATA = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/champid-cdragon.json"

	constructor() { }

	getChampRatings() {
		fetchAll.urls = Object.values(ddragon.champions).map(champ => this.URL_DATA.replace("champid-cdragon", champ.ids.cdragon));

		fetchAll.callback = function(json) {
			if (!ddragon.champions[fetchAll.i].ratings)
				ddragon.champions[fetchAll.i].ratings = {};
			ddragon.champions[fetchAll.i].ratings.difficulty = json.tacticalInfo.difficulty;
			ddragon.champions[fetchAll.i].ratings.style = json.tacticalInfo.style * 10;
			//graph
			ddragon.champions[fetchAll.i].ratings.damage = json.playstyleInfo.damage;
			ddragon.champions[fetchAll.i].ratings.toughness = json.playstyleInfo.durability;
			ddragon.champions[fetchAll.i].ratings.control = json.playstyleInfo.crowdControl;
			ddragon.champions[fetchAll.i].ratings.mobility = json.playstyleInfo.mobility;
			ddragon.champions[fetchAll.i].ratings.utility = json.playstyleInfo.utility;
		};

		fetchAll.start();
	}
}