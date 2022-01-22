class ChampCardManager {
	table = {};
	activeAbility = 0;

	constructor() {
		this.findFields();
	}

	/****************************************** SHOW / HIDE CARD *************************************/

	/* !! don't use show/hide functions directly. use champlist.select/deselect() instead */

	show() {
		$id("champcard").classList.remove("hide");
	}

	hide() {
		$id("champcard").classList.add("hide");
	}

	isOpen() {
		return !$id("champcard").classList.contains("hide");
	}

	/****************************************** SET / SHOW DATA **************************************/

	showChamp(i) {

		/******************************** TITLE ********************************/

		this.table.name.textContent = champions[i].name;
		this.table.title.textContent = champions[i].title;

		/******************************** ABILITIES ********************************/

		// remove existing highlights
		this.table.ability[0].row.classList.remove("highlight");
		this.table.ability[1].row.classList.remove("highlight");
		this.table.ability[2].row.classList.remove("highlight");
		this.table.ability[3].row.classList.remove("highlight");
		this.table.ability[4].row.classList.remove("highlight");

		// reset image to blank
		this.table.ability[0].img.setAttribute("src", "assets/placeholder.png");
		this.table.ability[1].img.setAttribute("src", "assets/placeholder.png");
		this.table.ability[2].img.setAttribute("src", "assets/placeholder.png");
		this.table.ability[3].img.setAttribute("src", "assets/placeholder.png");
		this.table.ability[4].img.setAttribute("src", "assets/placeholder.png");

		// set new images
		this.table.ability[0].img.setAttribute("src", champions[i].abilities[0].img);
		this.table.ability[1].img.setAttribute("src", champions[i].abilities[1].img);
		this.table.ability[2].img.setAttribute("src", champions[i].abilities[2].img);
		this.table.ability[3].img.setAttribute("src", champions[i].abilities[3].img);
		this.table.ability[4].img.setAttribute("src", champions[i].abilities[4].img);

		/******************************** ABILITY NAMES ********************************/

		this.table.ability[0].name.textContent = champions[i].abilities[0].name;
		this.table.ability[1].name.textContent = champions[i].abilities[1].name;
		this.table.ability[2].name.textContent = champions[i].abilities[2].name;
		this.table.ability[3].name.textContent = champions[i].abilities[3].name;
		this.table.ability[4].name.textContent = champions[i].abilities[4].name;

		/******************************** OTHER TEXT ********************************/

		this.table.col[1].row[0].textContent = champions[i].lanes.replaceAll(" ", ", ");
		this.table.col[1].row[1].textContent = (champions[i].tags+"").replaceAll(",", ", ");
		this.table.col[1].row[2].textContent = champions[i].rangeType + " (" + champions[i].attackRange + ")";
		this.table.col[1].row[3].textContent = champions[i].resource;
		this.table.col[1].row[4].textContent = champions[i].region + ", " + champions[i].species;
		this.table.col[2].row[0].textContent = champions[i].releasePatch + " (" + champions[i].releaseDate + ")";

		/******************************** RATINGS ********************************/

		this.table.ratings["damage"].setAttribute("data-value", champions[i].ratings.damage);
		this.table.ratings["toughness"].setAttribute("data-value", champions[i].ratings.toughness);
		this.table.ratings["control"].setAttribute("data-value", champions[i].ratings.control);
		this.table.ratings["mobility"].setAttribute("data-value", champions[i].ratings.mobility);
		this.table.ratings["utility"].setAttribute("data-value", champions[i].ratings.utility);

		this.table.ratings["difficulty"].setAttribute("data-value", champions[i].ratings.difficulty);
		this.table.ratings["style"].icons.setAttribute("data-majority", champions[i].ratings.style < 50 ? "attack" : "spell");
		this.table.ratings["style"].bar.style.width = champions[i].ratings.style + "%";

		this.table.ratings["damageBreakdown"].magic.style.width = champions[i].ratings.damageBreakdown.magic + "%";
		this.table.ratings["damageBreakdown"].physical.style.width = champions[i].ratings.damageBreakdown.physical + "%";
		this.table.ratings["damageBreakdown"].true_.style.width = champions[i].ratings.damageBreakdown.true_ + "%";

		/******************************** OTHER ICONS ********************************/

		// ICONS
		this.table.icons["region"].setAttribute("src", "assets/"+champions[i].region.replaceAll(" ", "_")+".png");
		this.table.icons["rangeType"].setAttribute("src", "assets/"+champions[i].rangeType+".png");

		// LANE
		let lane = champions[i].lanes.split(" ")[0];
		this.table.icons["lane"]["Top"].classList.add("hide");
		this.table.icons["lane"]["Jungle"].classList.add("hide");
		this.table.icons["lane"]["Middle"].classList.add("hide");
		this.table.icons["lane"]["Bottom"].classList.add("hide");
		this.table.icons["lane"]["Support"].classList.add("hide");
		this.table.icons["lane"][lane].classList.remove("hide");

		// ROLE
		let role = champions[i].tags[0];
		this.table.icons["role"]["Tank"].classList.add("hide");
		this.table.icons["role"]["Fighter"].classList.add("hide");
		this.table.icons["role"]["Assassin"].classList.add("hide");
		this.table.icons["role"]["Mage"].classList.add("hide");
		this.table.icons["role"]["Marksman"].classList.add("hide");
		this.table.icons["role"]["Support"].classList.add("hide");
		this.table.icons["role"][role].classList.remove("hide");

		// RESOURCE
		switch (champions[i].resource) {
			default:
			case "None": this.table.icons["resource"].setAttribute("src", "assets/placeholder.png"); break;
			case "Mana": this.table.icons["resource"].setAttribute("src", "assets/mana.png"); break;
			case "Energy": this.table.icons["resource"].setAttribute("src", "assets/energy.png"); break;
			case "Heat": this.table.icons["resource"].setAttribute("src", "assets/heat.png"); break;
			case "Shield":
			case "Blood Well":
			case "Flow": this.table.icons["resource"].setAttribute("src", "assets/flow.png"); break;
			case "Health": this.table.icons["resource"].setAttribute("src", "assets/health.png"); break;
			case "Courage":
			case "Crimson Rush":
			case "Ferocity":
			case "Grit":
			case "Rage":
			case "Fury": this.table.icons["resource"].setAttribute("src", "assets/fury.png"); break;
		}

		/******************************** LINKS ********************************/

		this.table.links["wiki"].setAttribute("href", champions[i].getUrlWikiAbilities());
		this.table.links["universe"].setAttribute("href", champions[i].getUrlUniverse());
		this.table.links["patchNotes"].setAttribute("href", champions[i].getUrlWikiPatchHistory());
		this.table.links["spotlight"].setAttribute("href", champions[i].getUrlChampionSpotlight());

		/******************************** ETC ********************************/

		this.#highlightAbilityRows();
		this.showAbility(i, this.activeAbility);
		this.#highlightSearchText();
	}

	/********** ABILITY **************/

	showAbility(champIndex, abilityIndex) {

		if (abilityIndex > 6) return;
		
		this.table.activeAbility.indicator.style.transform = `translateY(${36*abilityIndex + (abilityIndex*1)}px)`;
		this.table.activeAbility.description.innerHTML = champions[champIndex].abilities[abilityIndex].description;
		this.table.activeAbility.video.setAttribute("src", champions[champIndex].abilities[abilityIndex].video);

		// handle case: no ability video


		// show tags
		let tagsText = champions[champIndex].tagArrays[abilityIndex + 1].map(tag => tags.find(({id}) => id === tag).name).join(", ");
		if (tagsText.length == 0) tagsText = "N/A";
		this.table.activeAbility.tags.textContent = tagsText;
		// this.table.activeAbility.scaling.text(champIndex + " " + abilityIndex);
	}

	nextAbility() {
		if (this.activeAbility +1 < +5) {
			this.activeAbility++;
			this.showAbility($champ, this.activeAbility);
		}
	}

	prevAbility() {
		if (this.activeAbility -1 > -1) {
			this.activeAbility--;
			this.showAbility($champ, this.activeAbility);
		}
	}

	/********** HIGHLIGHT ************/

	#highlightSearchText() {
		this.#highlightTextNode(this.table.title);
		for (let c = 0; c < 3; c++) {
			this.table.col[c].row.forEach(e => this.#highlightTextNode(e));
		}
	}

	#highlightTextNode(element) {
		let text = element.textContent.trim();
		let text_ = text.toLowerCase();

		if (search.text && search.text.length > 0 && text_.includes(search.text)) {
			let a = text_.indexOf(search.text);
			let b = a + search.text.length;
			let span = text.substring(0, a) + "<span class='highlight'>" + text.substring(a, b) + "</span>" + text.substring(b, text.length);
			element.innerHTML = span;
		}
	}

	#highlightAbilityRows() {
		if (!search.tagId) return;

		let firstAbility = true;
		champions[$champ].tagArrays.forEach((ability, i) => {
			if (i == 0) return;
			if (ability.includes(search.tagId)) {
				this.table.ability[i-1].row.classList.add("highlight");
				/* if there are multiple abilities, only set the first one as active */
				if (firstAbility)
					this.activeAbility = i -1;
				firstAbility = false;
			}
		});
	}

	/****************************************** CLICK ************************************************/

	onClickAbility(i) {
		this.activeAbility = i;
		this.showAbility($champ, i);
	}

	onClickCopy(i) {
		/* copy ability name to clipboard as: Ability (K) */
		let s = champions[$champ].abilities[i].name;
		
		switch (i) {
			case 0: s += " (P)"; break;
			case 1: s += " (Q)"; break;
			case 2: s += " (W)"; break;
			case 3: s += " (E)"; break;
			case 4: s += " (R)"; break;
		}

		navigator.clipboard.writeText(s);
		alert.show();
	}

	/****************************************** INIT FIELDS ******************************************/

	findFields() {
		this.table = {
			name: $id("champcard__name"),
			title: $id("champcard__title"),
			activeAbility: {
				indicator: $id("champcard__active-ability-indicator"),
				description: $id("ability-desc"),
				tags: $id("ability-tags"),
				scaling: $id("ability-scalings"),
				videoBtn: $id("video-btn"),
				video: $tag("video")[0]},
			ability: [
					{row: $query(".col:nth-child(1) .row:nth-child(2)"), key: $query(".row:nth-child(2) .ability .key"), img: $query(".row:nth-child(2) .ability img"), name: $query(".row:nth-child(2) .ability .name")},
					{row: $query(".col:nth-child(1) .row:nth-child(3)"), key: $query(".row:nth-child(3) .ability .key"), img: $query(".row:nth-child(3) .ability img"), name: $query(".row:nth-child(3) .ability .name")},
					{row: $query(".col:nth-child(1) .row:nth-child(4)"), key: $query(".row:nth-child(4) .ability .key"), img: $query(".row:nth-child(4) .ability img"), name: $query(".row:nth-child(4) .ability .name")},
					{row: $query(".col:nth-child(1) .row:nth-child(5)"), key: $query(".row:nth-child(5) .ability .key"), img: $query(".row:nth-child(5) .ability img"), name: $query(".row:nth-child(5) .ability .name")},
					{row: $query(".col:nth-child(1) .row:nth-child(6)"), key: $query(".row:nth-child(6) .ability .key"), img: $query(".row:nth-child(6) .ability img"), name: $query(".row:nth-child(6) .ability .name")}],
			col: [
				{row: [
					$query(".col:nth-child(1) .row:nth-child(2) p.name"),
					$query(".col:nth-child(1) .row:nth-child(3) p.name"),
					$query(".col:nth-child(1) .row:nth-child(4) p.name"),
					$query(".col:nth-child(1) .row:nth-child(5) p.name"),
					$query(".col:nth-child(1) .row:nth-child(6) p.name")]},
				{row: [
					$query(".col:nth-child(2) .row:nth-child(2) p"),
					$query(".col:nth-child(2) .row:nth-child(3) p"),
					$query(".col:nth-child(2) .row:nth-child(4) p"),
					$query(".col:nth-child(2) .row:nth-child(5) p"),
					$query(".col:nth-child(2) .row:nth-child(6) p")]},
				{row: [
					$query(".col:nth-child(3) .row:nth-child(2) p"),
					$query(".col:nth-child(3) .row:nth-child(3) p"),
					$query(".col:nth-child(3) .row:nth-child(4) p"),
					$query(".col:nth-child(3) .row:nth-child(5) p"),
					$query(".col:nth-child(3) .row:nth-child(6) p")]},
				{row: [
					$query(".col:nth-child(4) .row:nth-child(2) p"),
					$query(".col:nth-child(4) .row:nth-child(3) p"),
					$query(".col:nth-child(4) .row:nth-child(4) p"),
					$query(".col:nth-child(4) .row:nth-child(5) p"),
					$query(".col:nth-child(4) .row:nth-child(6) p")]}],
			icons: {
				region: $id("champcard__region"),
				lane: {
					Top: $id("champcard__top"),
					Jungle: $id("champcard__jungle"),
					Middle: $id("champcard__mid"),
					Bottom: $id("champcard__bot"),
					Support: $id("champcard__sup")},
				role: {
					Tank: $id("champcard__tank"),
					Fighter: $id("champcard__fighter"),
					Assassin: $id("champcard__assassin"),
					Mage: $id("champcard__mage"),
					Marksman: $id("champcard__marksman"),
					Support: $id("champcard__support")},
				rangeType: $id("champcard__rangetype"),
				resource: $id("champcard__resource")},
			links: {
				wiki: $id("champ_wiki"),
				universe: $id("champ_universe"),
				patchNotes: $id("champ_patchnotes"),
				spotlight: $id("champ_spotlight")},
			ratings: {
				damage: $query("#champcard__table .bars .bar-wrapper:nth-child(1)"),
				mobility: $query("#champcard__table .bars .bar-wrapper:nth-child(2)"),
				toughness: $query("#champcard__table .bars .bar-wrapper:nth-child(3)"),
				control: $query("#champcard__table .bars .bar-wrapper:nth-child(4)"),
				utility: $query("#champcard__table .bars .bar-wrapper:nth-child(5)"),
				damageType: $id("damage-bar"),
				difficulty: $id("difficulty-bar"),
				style: {
					icons: $id("style-bar-wrapper"),
					bar: $query("#style-bar .bar")},
				damageBreakdown: {
					tooltip: $id("damage-bar"),
					magic: $query("#damage-bar .bar.magic"),
					physical: $query("#damage-bar .bar.physical"),
					true_: $query("#damage-bar .bar.true"),
				}
			}
		};
	}

	/****************************************** ETC **************************************************/

	calculateWidth() {
		$id("champcard").style.width = ($id("champ-list__wrapper").clientWidth + 21) + "px";
	}
}