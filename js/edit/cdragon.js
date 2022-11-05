class CDragon {

	lanes = {};
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

	updateChampionLanes() {
		fetch("https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-statistics/global/default/rcp-fe-lol-champion-statistics.js")
			.then(response => response.text())
			.then(text => {
				let a = text.lastIndexOf("a.exports=") + 10;
				let b = text.lastIndexOf("},f");
				text = text.substring(a, b);
				text = text.replace(/[^\s{}:,]+/g, (match) => `"${match}"`);
				this.lanes = JSON.parse(text);
				this.updateLanesMain();
			});
	}

	updateLanesMain() {
		//reset
		champions.forEach(champ => champ.lanes = []);

		//add all
		Object.entries(this.lanes).forEach(entry => {
			let lane = `${entry[0].slice(0, 1).toUpperCase()}${entry[0].slice(1).toLowerCase()}`;
			Object.keys(entry[1]).forEach(champId => {
				let champ = champions.find(champ => champ.ids.cdragon == champId);
				champ.lanes.push(lane);
			});
		});

		//check for missings
		champions.forEach((champ, i) => {
			if (champ.lanes.length == 0)
				console.error(`Champion has no lane: ${i}:${champ.name}`);
		});

		log("Champion lanes have been updated.")
	}
}