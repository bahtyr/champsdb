class DDragon {

	THIS = this; //might be needed when using within ajax
	version;
	champions = [];

	// JSON URLS
	URL_VERSION = "https://ddragon.leagueoflegends.com/api/versions.json";
	URL_CHAMPIONS = "http://ddragon.leagueoflegends.com/cdn/version/data/en_US/champion.json";
	URL_CHAMP = "http://ddragon.leagueoflegends.com/cdn/version/data/en_US/champion/champid.json"
	// URLS
	URL_CHAMP_PORTRAIT = "http://ddragon.leagueoflegends.com/cdn/version/img/champion/";
	URL_IMG_PASSIVE = "http://ddragon.leagueoflegends.com/cdn/version/img/passive/";
	URL_IMG_SPELL = "http://ddragon.leagueoflegends.com/cdn/version/img/spell/";
	URL_CHAMP_SPLASH = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/";
	URL_CHAMP_SPLASH_END = "_0.jpg"
	
	/**
	 * Get latest patch version (necessary for other links) from an array of all versions.
	 */
	constructor() {
		fetch(this.URL_VERSION).then(data => data.json()).then(json => {
			this.version = json[0];
			this.URL_CHAMPIONS = this.URL_CHAMPIONS.replace("version", this.version);
			this.URL_CHAMP = this.URL_CHAMP.replace("version", this.version);
			this.URL_CHAMP_PORTRAIT = this.URL_CHAMP_PORTRAIT.replace("version", this.version);
			this.URL_IMG_PASSIVE = this.URL_IMG_PASSIVE.replace("version", this.version);
			this.URL_IMG_SPELL = this.URL_IMG_SPELL.replace("version", this.version);
		});
	}

	/**
	 * Get basic champion info.
	 * - Name, Title, Tags[Fighter, Tank..], Portrait
	 */
	getChamps() {
		this.champions = [];
		fetch(this.URL_CHAMPIONS).then(data => data.json()).then(json => {
			Object.values(json.data).forEach(champ => {
				let obj = {};
				
				obj.id = {};
				obj.id.pascal = ChampionMiscFunctions.toPascalCase(champ.name);
				obj.id.kebab = ChampionMiscFunctions.toKebabCase(champ.name);
				obj.id.cdragon = champ.key;
				obj.id.ddragon = champ.id;
				obj.id.wiki = ChampionMiscFunctions.toWikiCase(champ.name);

				obj.name = champ.name;
				obj.title = champ.title;
				obj.tags = champ.tags;
				obj.portrait = this.URL_CHAMP_PORTRAIT + champ.image.full;
				obj.splash = this.URL_CHAMP_SPLASH + champ.id + this.URL_CHAMP_SPLASH_END;
				obj.resource = champ.partype;
				obj.attackRange = champ.stats.attackrange;
				this.champions.push(obj);
			});

			this.champions.sort(ChampionFunctions.compareNames);

			console.log(this.champions);
			log(`Loaded ${this.champions.length} champions.`);
		});
	}

	/**
	 * Get champions' ability info (img,name,desc).
	 */
	getChampAbilities() {
		if (this.champions.length == 0) console.error("ddragon.champions[] is empty! Run ddragon.getChamps();");
		fetchAll.urls = Object.values(this.champions).map(champ => this.URL_CHAMP.replace("champid", champ.id.ddragon));
		// fetchAll.urls = ["http://ddragon.leagueoflegends.com/cdn/12.7.1/data/en_US/champion/Zeri.json"];
		fetchAll.callback = function(json) {
			
			let champ = Object.values(json.data)[0]; //data.champid
			ddragon.champions[fetchAll.i].abilities = []; // this won't work properly if fetchAll.length != champions.length
			ddragon.champions[fetchAll.i].abilities.push({
				name: champ.passive.name, 
				img: ddragon.URL_IMG_PASSIVE + champ.passive.image.full,
				description: champ.passive.description
			});
			
			champ.spells.forEach(spell => {	
				ddragon.champions[fetchAll.i].abilities.push({
					name: spell.name, 
					img: ddragon.URL_IMG_SPELL + spell.image.full,
					description: spell.description
				});
			});
		};
		fetchAll.start();
	}

	/**
	 * Get champions' region from their Universe page. CORS!! not working yet.
	 */
	getChampLoreInfo() {
		if (this.champions.length == 0) console.error("ddragon.champions[] is empty! Run ddragon.getChamps();");
		
		fetchAll.urls = Object.values(this.champions).map(champ => {
			champ.getUrlUniverse = ChampionFunctions.getUrlUniverse;
			return champ.getUrlUniverse();
		});

		fetchAll.callback = function(json) {
			let html = $(data);
			let region = $("div.factionText_EnRL > h6 > span").text();
			ddragon.champions[fetchAll.i].region = region;
		};

		fetchAll.start();
	}
}