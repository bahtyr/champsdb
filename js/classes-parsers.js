/**
 * Methods related to parsing data from other sources will be here.
 */

class RiotApi {
	urlchamp = "asdf";
	URL_CHAMP_PORTRAIT = "http://ddragon.leagueoflegends.com/cdn/version/img/champion/";
	URL_CHAMP_SPLASH = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/";
	URL_CHAMP_SPLASH_END = "_0.jpg"
	URL_IMG_PASSIVE = "http://ddragon.leagueoflegends.com/cdn/version/img/passive/";
	URL_IMG_SPELL = "http://ddragon.leagueoflegends.com/cdn/version/img/spell/";
	version;
	champions;

	constructor() { }

	/**
	 * Get latest patch version (necessary for other links) from an array of versions.
	 */
	init(THIS = this) {
		$.ajax({type: "GET", url: "https://ddragon.leagueoflegends.com/api/versions.json",
			success: function(data, textStatus) {
				THIS.version = data[0];
				THIS.URL_CHAMP_PORTRAIT = THIS.URL_CHAMP_PORTRAIT.replace("version", THIS.version);
				THIS.URL_IMG_PASSIVE = THIS.URL_IMG_PASSIVE.replace("version", THIS.version);
				THIS.URL_IMG_SPELL = THIS.URL_IMG_SPELL.replace("version", THIS.version);
				textarea.val(`Patch: ${THIS.version}`);
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	/**
	 * Get basic champion info.
	 * - Name, Title, Tags[Fighter, Tank..], Portrait
	 * - More Dataw: Bio, Resource Type, Champion Utility Score
	 */
	loadChamps(THIS = this) {
		if (this.version == null) throw '! Version is not initialized.';

		$.ajax({
			type: "GET",
			dataType: "json",
			url: `http://ddragon.leagueoflegends.com/cdn/${THIS.version}/data/en_US/champion.json`,
			success: function(data, textStatus) {
				THIS.champions = [];
				let d = data.data;
				for (let i in d) {
					let obj = {};
					obj.id = d[i].id;
					obj.name = d[i].name;
					obj.title = d[i].title;
					obj.tags = d[i].tags;
					obj.portrait = THIS.URL_CHAMP_PORTRAIT + d[i].image.full;
					obj.splash = THIS.URL_CHAMP_SPLASH + d[i].id + THIS.URL_CHAMP_SPLASH_END;
					obj.partype = d[i].partype;
					obj.attackRange = d[i].stats.attackrange;
					THIS.champions.push(obj);
				}
				textarea.val(`Loaded ${THIS.champions.length} champions.`);
				THIS.champions.sort(Champion.sortByName);

				// let i = -1;
				// for (let champ in THIS.champions) {
				// 	i += 1;
				// 	if (champions[i].id == THIS.champions[champ].id) {
				// 		champions[i].resource = THIS.champions[champ].partype;
				// 		champions[i].attackRange = THIS.champions[champ].attackRange;
				// 	} else {
				// 		console.log("Failed to find " + champ);
				// 	}
				// }

				// console.log(champions);
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	/**
	 * Start champions' abilities requests.
	 */
	loadChampsAbilities() {
		if (this.version == null) throw '! Version is not initialized.';
		textarea.val(`Loading abilities for ${this.champions.length} champions.`);
		this.loadChampAbilities(0);
	}

	/**
	 * Get a champion's ability name and image.
	 */
	loadChampAbilities(i, THIS = this) {
		$.ajax({
			type: "GET",
			dataType: "json",
			url: `http://ddragon.leagueoflegends.com/cdn/${THIS.version}/data/en_US/champion/${THIS.champions[i].id}.json`,
			success: function(data, textStatus) {
				let d = data.data[THIS.champions[i].id];
				THIS.champions[i].abilities = [];
				THIS.champions[i].abilities.push({name: d.passive.name, img: THIS.URL_IMG_PASSIVE + d.passive.image.full});
				
				for (let s in d.spells) {
					THIS.champions[i].abilities.push({name: d.spells[s].name, img: THIS.URL_IMG_SPELL + d.spells[s].image.full});
				}

				if (i < THIS.champions.length - 1) {
					i++;
					THIS.loadChampAbilities(i);
				} else {
					textarea.val(`Loaded abilities for ${i+1} champions.`);
				}
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	printChampions() {
		textarea.val(JSON.stringify(this.champions));
	}

	/**
	 * Lookup a champ with name, then add it to the main champions array.
	 * Note: champions array is passed, because we lose acces to it due to having same variable name.
	 */
	findChampAndAdd(champions) {
		let s = textarea.val();
		let matchFound = false;

		for (let i in this.champions) {
			if (this.champions[i].name == s) {
				champions.push(champions[i]);
				textarea.val(JSON.stringify(champions));
				matchFound = true;
			}
		}

		if (!matchFound)
			textarea.val(`! ${s} is not found in champions.`);
		return;
	}

	loadChampsUniversePages() {
		textarea.val(`Loading Universe pages for ${champions.length} champions.`);
		this.loadChampUniversePage(0);
	}

	arr = [];
	loadChampUniversePage(i, THIS = this) {
		$.ajax({type: "GET", url: Champion.getUrlUniverse(champions[i].id),
			success: function(data, textStatus) {
				console.log(champions[i].id);
				let html = $(data);
				let region = $("div > div.container_1IcS > div.championType_A59o > ul > li.playerFaction_2tnr.right_LBiI > a > div > div.top_1SjP > div.factionText_EnRL > h6 > span").text();
				This.arr.push({name: champions[i].name, region: region});

				if (i < champions.length - 1) {
					i++;
					THIS.loadChampUniversePage(i);
				} else {
					textarea.val(`Loaded Universe pages for ${i+1} champions.`);
					console.log(THIS.arr);
				}
			},
			error: (textStatus, errorThrown) => console.error(textStatus)
		});
	}
}

class WikiApi {
	arr = [];
	patchDates = [];

	constructor() { }

	/**
	 * Start champions' abilities requests.
	 */
	loadAll() {
		textarea.val(`Loading release dates for ${champions.length} champions.`);
		this.loadChampPage(0);
	}

	/**
	 * Get a champion's ability name and image.
	 */
	loadChampPage(i, THIS = this) {
		$.ajax({type: "GET", url: Champion.getUrlWikiAbilities(champions[i].name),
			success: function(data, textStatus) {
				let html = $(data);
				// let releaseDate = html.find("#infobox-champion-container > aside > div:nth-child(4) > div").text();
				// let resource = html.find("#infobox-champion-container > aside > div:nth-child(9) > div").text();
				// let rangeType = html.find("#infobox-champion-container > aside > div:nth-child(10) > div > span > a.mw-redirect").text();
				
				let ratings = {};
				// let s = html.find("[data-source='ratings']").text().trim().split("                    ");
				// ratings.damage = parseInt(s[0].substring(s[0].length -1));
				// ratings.toughness = parseInt(s[1].substring(s[1].length -1));
				// ratings.control = parseInt(s[2].substring(s[2].length -1));
				// ratings.mobility = parseInt(s[3].substring(s[3].length -1));
				// ratings.utility = parseInt(s[4].substring(s[4].length -1));
				// ratings.champion = champions[i].name;
				// champions[i].ratings = ratings;

				let a = html.find(".champion_style span:nth-child(2)").attr("title");


				// champions[i].releaseDate = releaseDate;
				// champions[i].resource = resource;
				// champions[i].rangeType = rangeType;
				
				THIS.arr.push(a);
				// THIS.arr.push({name: champions[i].name, releaseDate: releaseDate, resource: resource, rangeType: rangeType});

				if (i < champions.length - 1) {
					i++;
					THIS.loadChampPage(i);
				} else {
					textarea.val(`Loaded release dates for ${i+1} champions.`);
					console.log(THIS.arr);
				}
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	loadLorePages() {
		textarea.val(`Loading.`);
		this.arr = [];
		this.loadChampLorePage(0);
	}

	loadChampLorePage(i, THIS = this) {
		$.ajax({type: "GET", url: Champion.getUrlWikiLore(champions[i].name),
			success: function(data, textStatus) {
				let html = $(data);
				let species;
				let region;

				html.find("h3").each(function() {
					switch ($(this).text()) {
						case "Species": species = $(this).next().text().trim(); break;
						case "Region(s)": region = $(this).next().text().trim(); break;
					}
				})

				// champions[i].releaseDate = releaseDate;
				// champions[i].resource = resource;
				// champions[i].rangeType = rangeType;
				
				THIS.arr.push({name: champions[i].name, region: region, species: species});

				if (i < champions.length - 1) {
					i++;
					THIS.loadChampLorePage(i);
				} else {
					textarea.val(`Done.`);
					console.log(THIS.arr);
				}
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
	}

	matchPatchDates() {
		let patchHistory;
		let list = JSON.parse(patchHistory);
		console.log(list);

		for (let c in champions) {
			if (list[champions[c].releaseDate] != null) {
				champions[c].releasePatch = list[champions[c].releaseDate];
			} else console.log(champions[c].name + " --- " + champions[c].releaseDate);
		}
	}

	//

	getChampionListFromText() {
		let s = textarea.val();
		let arr = [];
		for (let i in champions) {
			if (s.includes(champions[i].name)) {
				arr.push(champions[i].name);
			}
		}

		textarea.val(arr);
	}

	getChampionAbilitiesFromText() {
		let s = textarea.val();
		let arr = [];
		for (let i in champions) {
			for (let a in champions[i].abilities) {
				
				// some champions abilities have 2 names such as Nidalee's Javelin Toss / Takedown (Q)
				// split it into two to check separetely
				let ability = champions[i].abilities[a].name;
				let ability2 = null;
				if (ability.includes("/")) {
					ability2 = ability.split("/")[1];
					ability = ability.split("/")[0];
				}

				if (s.includes(ability) || (ability2 != null && s.includes(ability2))) {
					arr.push(champions[i].name+"#"+a);
				}
			}
		}

		textarea.val(arr);

		let inputLength = s.split("\n").length;
		if (arr.length != inputLength)
			console.warn(`Result length does not match input length. Difference: ${inputLength - arr.length}`);
	}
}

/*
 * to be used manually..
 */
function printPatchDates() {
	let table = "#mw-content-text > div.mw-parser-output > div > div.wds-tab__content.wds-is-current > table";
	let rowCount = $(table)[0].rows.length;
	let data = [];

	for (let i = 2; i <= rowCount; i++) {
		let date = $(`${table} > tbody > tr:nth-child(${i}) > td:nth-child(1)`).text().replace("\n", "");
		let patch = $(`${table} > tbody > tr:nth-child(${i}) > td:nth-child(2)`).text().replace("\n", "");
		date = date.replace("(Notes)", "");
		data.push(`${date}	${patch}`);
	}

	console.log(JSON.stringify(data));
}