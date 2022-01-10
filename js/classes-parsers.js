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
				// THIS.champions[i].abilities.push({name: d.passive.name, img: THIS.URL_IMG_PASSIVE + d.passive.image.full});
				THIS.champions[i].abilities.push({description: d.passive.description});
				
				for (let s in d.spells) {
					// THIS.champions[i].abilities.push({name: d.spells[s].name, img: THIS.URL_IMG_SPELL + d.spells[s].image.full});
					THIS.champions[i].abilities.push({description: d.spells[s].description});
				}

				if (i < THIS.champions.length - 1) {
					i++;
					THIS.loadChampAbilities(i);
				} else {
					THIS.champions.sort(Champion.sortByName);
					console.log(THIS.champions);
					for (let i in champions) {
						if (champions[i].id == THIS.champions[i].id) {
							champions[i].abilities[0].description = THIS.champions[i].abilities[0].description;
							champions[i].abilities[1].description = THIS.champions[i].abilities[1].description;
							champions[i].abilities[2].description = THIS.champions[i].abilities[2].description;
							champions[i].abilities[3].description = THIS.champions[i].abilities[3].description;
							champions[i].abilities[4].description = THIS.champions[i].abilities[4].description;
						} else {
							console.erro(champions[i].id);
						}
					}
					console.log(champions);
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
				let b = html.find(".champion_style span:nth-child(2)").attr("title");
				// let difficulty = parseInt(html.find(".pi-item[data-source='difficulty'] img").attr("alt")[20]);
				// champions[i].ratings.difficulty = a;
				champions[i].ratings.style = parseInt(b);




				// champions[i].releaseDate = releaseDate;
				// champions[i].resource = resource;
				// champions[i].rangeType = rangeType;
				
				THIS.arr.push(parseInt(b));
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

function laodURL(url_, fn) {
	$.ajax({type: "GET", url: url_,
			success: function(data, textStatus) {
				fn(data);
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
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

/**
 * Load a URL for every champion method.
 */

let arr = [];
let loadURL = "";
let loadURLlist = [];
let loadURLonLoad = function () {};
let loadURLonComplete = function () {};

function loadURLforAllChamps(idType, url, fn) {
	arr = [];
	loadURL = url;
	loadURLonLoad = fn || loadURLonLoad;
	console.warn("Loading URL for every champ.");
	laodURLforChamp(idType, 0);
}

function laodURLforChamp(idType, i) {
	// console.warn(i);
	let id;
	switch (idType) {
		case "int": id = i; break;
		case "name": id = champions[i].name; break;
		case "pascal": id = champions[i].id_.pascal; break;
		case "kebab": id = champions[i].id_.kebab; break;
		case "id": id = champions[i].id; break;
		case "url": id = loadURLlist[i]; break;
	}
	console.warn(loadURL.replace("${id}", id));
	$.ajax({type: "GET", url: loadURL.replace("${id}", id),
			success: function(data, textStatus) {
				
				loadURLonLoad(data, i, id);

				if (i+1 < champions.length) {
					i++;
					laodURLforChamp(idType, i);
					// console.warn("Done");
					// console.log(arr);
				} else {
					console.warn("Done");
					console.log(arr);
					loadURLonComplete();
				}
			},
			error: (textStatus, errorThrown) => console.error(errorThrown)
		});
}

/**
 * Iterations.
 */

function loadDamageBreakdown() {
	loadURLforAllChamps("name", "https://gol.gg/champion/champion-stats/${id}/season-S11/split-ALL/tournament-ALL/", function(data) {
		let html = $(data);
		let s = html.find("#DmgChart").parent().prev()[0].innerHTML.split(/\r?\n/);

		let obj = {
			champion: html.find("h1").text().trim(),
			physical: parseFloat(s[15].replace(/[^0-9.]/g, '')),
			magic: parseFloat(s[28].replace(/[^0-9.]/g, '')),
			true: parseFloat(s[41].replace(/[^0-9.]/g, ''))
		};

		arr.push(obj);
	});
}

function loadAbilityVideos() {
	loadURLlist = [
		"/champion/266/Aatrox",
		"/champion/103/Ahri",
		"/champion/84/Akali",
		"/champion/166/Akshan",
		"/champion/12/Alistar",
		"/champion/32/Amumu",
		"/champion/34/Anivia",
		"/champion/1/Annie",
		"/champion/523/Aphelios",
		"/champion/22/Ashe",
		"/champion/136/Aurelion-Sol",
		"/champion/268/Azir",
		"/champion/432/Bard",
		"/champion/53/Blitzcrank",
		"/champion/63/Brand",
		"/champion/201/Braum",
		"/champion/51/Caitlyn",
		"/champion/164/Camille",
		"/champion/69/Cassiopeia",
		"/champion/31/Cho'Gath",
		"/champion/42/Corki",
		"/champion/122/Darius",
		"/champion/131/Diana",
		"/champion/36/Dr.-Mundo",
		"/champion/119/Draven",
		"/champion/245/Ekko",
		"/champion/60/Elise",
		"/champion/28/Evelynn",
		"/champion/81/Ezreal",
		"/champion/9/Fiddlesticks",
		"/champion/114/Fiora",
		"/champion/105/Fizz",
		"/champion/3/Galio",
		"/champion/41/Gangplank",
		"/champion/86/Garen",
		"/champion/150/Gnar",
		"/champion/79/Gragas",
		"/champion/104/Graves",
		"/champion/887/Gwen",
		"/champion/120/Hecarim",
		"/champion/74/Heimerdinger",
		"/champion/420/Illaoi",
		"/champion/39/Irelia",
		"/champion/427/Ivern",
		"/champion/40/Janna",
		"/champion/59/Jarvan-IV",
		"/champion/24/Jax",
		"/champion/126/Jayce",
		"/champion/202/Jhin",
		"/champion/222/Jinx",
		"/champion/145/Kai'Sa",
		"/champion/429/Kalista",
		"/champion/43/Karma",
		"/champion/30/Karthus",
		"/champion/38/Kassadin",
		"/champion/55/Katarina",
		"/champion/10/Kayle",
		"/champion/141/Kayn",
		"/champion/85/Kennen",
		"/champion/121/Kha'Zix",
		"/champion/203/Kindred",
		"/champion/240/Kled",
		"/champion/96/Kog'Maw",
		"/champion/7/LeBlanc",
		"/champion/64/Lee-Sin",
		"/champion/89/Leona",
		"/champion/876/Lillia",
		"/champion/127/Lissandra",
		"/champion/236/Lucian",
		"/champion/117/Lulu",
		"/champion/99/Lux",
		"/champion/54/Malphite",
		"/champion/90/Malzahar",
		"/champion/57/Maokai",
		"/champion/11/Master-Yi",
		"/champion/21/Miss-Fortune",
		"/champion/82/Mordekaiser",
		"/champion/25/Morgana",
		"/champion/267/Nami",
		"/champion/75/Nasus",
		"/champion/111/Nautilus",
		"/champion/518/Neeko",
		"/champion/76/Nidalee",
		"/champion/56/Nocturne",
		"/champion/20/Nunu-Willump",
		"/champion/2/Olaf",
		"/champion/61/Orianna",
		"/champion/516/Ornn",
		"/champion/80/Pantheon",
		"/champion/78/Poppy",
		"/champion/555/Pyke",
		"/champion/246/Qiyana",
		"/champion/133/Quinn",
		"/champion/497/Rakan",
		"/champion/33/Rammus",
		"/champion/421/Rek'Sai",
		"/champion/526/Rell",
		"/champion/58/Renekton",
		"/champion/107/Rengar",
		"/champion/92/Riven",
		"/champion/68/Rumble",
		"/champion/13/Ryze",
		"/champion/360/Samira",
		"/champion/113/Sejuani",
		"/champion/235/Senna",
		"/champion/147/Seraphine",
		"/champion/875/Sett",
		"/champion/35/Shaco",
		"/champion/98/Shen",
		"/champion/102/Shyvana",
		"/champion/27/Singed",
		"/champion/14/Sion",
		"/champion/15/Sivir",
		"/champion/72/Skarner",
		"/champion/37/Sona",
		"/champion/16/Soraka",
		"/champion/50/Swain",
		"/champion/517/Sylas",
		"/champion/134/Syndra",
		"/champion/223/Tahm-Kench",
		"/champion/163/Taliyah",
		"/champion/91/Talon",
		"/champion/44/Taric",
		"/champion/17/Teemo",
		"/champion/412/Thresh",
		"/champion/18/Tristana",
		"/champion/48/Trundle",
		"/champion/23/Tryndamere",
		"/champion/4/Twisted-Fate",
		"/champion/29/Twitch",
		"/champion/77/Udyr",
		"/champion/6/Urgot",
		"/champion/110/Varus",
		"/champion/67/Vayne",
		"/champion/45/Veigar",
		"/champion/161/Vel'Koz",
		"/champion/711/Vex",
		"/champion/254/Vi",
		"/champion/234/Viego",
		"/champion/112/Viktor",
		"/champion/8/Vladimir",
		"/champion/106/Volibear",
		"/champion/19/Warwick",
		"/champion/62/Wukong",
		"/champion/498/Xayah",
		"/champion/101/Xerath",
		"/champion/5/Xin-Zhao",
		"/champion/157/Yasuo",
		"/champion/777/Yone",
		"/champion/83/Yorick",
		"/champion/350/Yuumi",
		"/champion/154/Zac",
		"/champion/238/Zed",
		"/champion/115/Ziggs",
		"/champion/26/Zilean",
		"/champion/142/Zoe",
		"/champion/143/Zyra"
	];
	loadURLforAllChamps("url", "https://www.lolrift.com/${id}"); 

	loadURLonLoad = function(data, id) {
		let html = $(data);
		let videos = [];
		html.find("video").each(function() {
			videos.push($(this).find("source").attr("src"));
		})

		arr.push({champ: id.substr(id.lastIndexOf("/")+1), videos: videos});
	};

	loadURLonComplete = function() {
		for (let i = 0; i < champions.length; i++) {
			if (arr[i].champ != champions[i].name)
				console.warn(`${arr[i].champ} != ${champions[i].name}`);
			champions[i].abilities[0].video = arr[i].videos[0];
			champions[i].abilities[1].video = arr[i].videos[1];
			champions[i].abilities[2].video = arr[i].videos[2];
			champions[i].abilities[3].video = arr[i].videos[3];
			champions[i].abilities[4].video = arr[i].videos[4];
		}

		console.log(champions[0]);
	};
}

function getVideoLinksFromRiotChampPage() {
	var em = document.querySelectorAll("video source");
	em.forEach(function(item) {
		if (item.getAttribute("src").includes("webm"))
			console.log(item.getAttribute("src"));
	});

	//
	for (let i in champions) {
		for (let a in champions[i].abilities) {
			if (!champions[i].abilities[a].video)
				console.log(`${champions[i].name} ${a}`);
		}
	}
}

// 

function getChampionSummary() {
	let link = "https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";

	laodURL(link, function(data) {

		for (let i = 0; i < data.length; i++) {
			let champ = Champion.getChampionByName(champions, data[i].name);
			if (champ == null) continue;
			champ.id_ = {};
			champ.id_.alias = data[i].alias;
			champ.id_.game = data[i].id;
		}

		console.log("done?");
	});
}

function getChampionPageData() {
	let link = "https://www.leagueoflegends.com/page-data/en-us/champions/aatrox/page-data.json";

	loadURLforAllChamps("kebab", "https://www.leagueoflegends.com/page-data/en-us/champions/${id}/page-data.json", function(data, i) {
		// console.log(data);
		data = data.result.data.all.nodes[0];
		champions[i].abilities[0].video = data.champion_passive.champion_passive_video_webm;
		champions[i].abilities[1].video = data.champion_q.champion_q_video_webm;
		champions[i].abilities[2].video = data.champion_w.champion_w_video_webm;
		champions[i].abilities[3].video = data.champion_e.champion_e_video_webm;
		champions[i].abilities[4].video = data.champion_r.champion_r_video_webm;
	});
}