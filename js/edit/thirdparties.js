class ThirdParties {
	
	// Data
	urls = [];
	damageBreakdown = [];

	// Games of Legends
	URL_GOL_START = "https://gol.gg/champion";
	URL_GOL = "https://gol.gg/champion/list/season-S12/split-Spring/tournament-ALL/"; // season no needs to be changed manually
	//URL_GOL_CHAMP = "https://gol.gg/champion/champion-stats/champno/season-S12/split-Spring/tournament-ALL/"; //ie. 37 (0..100+)

	constructor() { }

	getGolChampUrls() {
		fetch(this.URL_GOL)
			.then(data => data.text())
			.then(html => {
				let doc = new DOMParser().parseFromString(html, 'text/html');
				let champs = doc.querySelectorAll("table.playerslist tr td a");
				champs.forEach(champ => {
					/** FILTER HERE IF NECESSARY **/
					if (!champ.textContent.includes("Zeri") && !champ.textContent.includes("Renata"))
						return;
					thirdparties.urls.push(
						thirdparties.URL_GOL_START + champ.getAttribute("href").substring(1))
				});
				console.warn("Games of Legends champions have loaded.")
			});
	}

	getChampDamageBreakdown() {
		fetchAll.urls = this.urls;
		// fetchAll.urls = ["https://gol.gg/champion/champion-stats/37/season-S12/split-Spring/tournament-ALL/"];

		fetchAll.callback = function(doc) {
			let champName = doc.querySelector("div h1").textContent.trim();
			let chartScript = doc.querySelectorAll("td script")[1].innerHTML.split(/\r?\n/);

			let obj = {
				name: champName,
				physical: parseFloat(chartScript[15].replace(/[^0-9.]/g, '')),
				magic: parseFloat(chartScript[28].replace(/[^0-9.]/g, '')),
				true_: parseFloat(chartScript[41].replace(/[^0-9.]/g, ''))
			};

			thirdparties.damageBreakdown.push(obj);
		};

		fetchAll.onEnd = function() {
			ddragon.champions.forEach(champ => {
				thirdparties.damageBreakdown.forEach(champ2 => {
					if (champ.name == champ2.name) {
						if (!champ.ratings) champ.ratings = {};
						champ.ratings.damageBreakdown = {
							physical: champ2.physical,
							magic: champ2.magic,
							true_: champ2.true_
						};
					}
				})
			})
		}

		fetchAll.startHtml();
	}
}