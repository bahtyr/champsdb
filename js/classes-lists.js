
class ChampionListManager {
	callback;
	items;   // actual champions data
	printer;
	visibleItems = [];
	i = -1;  // items index
	ii = -1; // items prev index
	v = -1;  // visible items index

	constructor() {
		Champion.loadChampions((data) => {
			this.items = data
			if (this.callback != null)
				this.callback();
		});
	}

	/**
	 * Set a callback method to execute when champions data is loaded.
	 */
	onLoad(callback) {
		if (this.items != null)
			callback();
		else this.callback = callback;
	}

	nextVisibleItem() {
		if (this.visibleItems.length == 0) {
			if (this.i + 1 < this.items.length) this.i++;
			return this.i;
		} else {
			if (this.v + 1 < this.visibleItems.length) this.v++;
			this.i = this.visibleItems[this.v];
			return this.visibleItems[this.v];
		}
	}

	prevVisibleItem() {
		if (this.i == -1) this.i = 0;
		if (this.v == -1) this.v = 0;
		
		if (this.visibleItems.length == 0){
			if (this.i - 1 >= 0) this.i--;
			return this.i;
		} else {
			if (this.v - 1 >= 0) this.v--;
			this.i = this.visibleItems[this.v];
			return this.visibleItems[this.v];
		}
	}

	findIndexInVisibleItems(i) {
		if (this.visibleItems.length < 1) return;

		for (let f = 0; f < this.visibleItems.length; f++) {
			if (i == this.visibleItems[f]) {
				this.v = f;
			}
		}
	}

	// SHOW HIDE CHAMPIONS

	reset() {
		this.visibleItems = [];
		this.i = -1;
		this.ii = -1;
		this.v = -1;
	}

	hide(i) {
		this.items[i].hide = true;
		this.printer.elements[i+1].classList.add("hide");
	}

	show(i) {
		this.items[i].hide = false;
		this.visibleItems.push(i);
		this.printer.elements[i+1].classList.remove("hide");
	}

	unhideAll() {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].hide = false;
			this.printer.elements[i].classList.remove("hide");
		}
		
		this.visibleItems = [];
		this.i = -1;
		this.v = -1;
	}

	/**
	 * Instead of looping through every champion and checking their name every time before hiding,
	 * this method;
	 * - creates an index list,
	 * - removes the exception(s) from our index list
	 * - the hide everything that is left
	 */
	hideAllExcept(champIndex) {
		if (typeof champIndex == "number") champIndex = [champIndex]; // convert this to an array for easier handling

		// get a simple integer list with the length of champs ([0,1,2..])
		let indexList = [];
		for (let i = 0; i < this.items.length; i++)
			indexList.push(i);

		// for every element to NOT hide, remove the integer from the list above
		for (let i = 0; i < champIndex.length; i++)
			indexList[champIndex[i]] = null;
		
		// loop through our integer list, and hide every element except null
		this.visibleItems = [];
		for (let i = 0; i < indexList.length; i++) {
			if (indexList[i] != null)
				this.hide(i);
			else this.show(i);
		}
	}
}

class TagsListManager {
	callback;
	tagsObj;
	items;

	constructor() {
		Tags.loadTags((data) => {
			this.tagsObj = data;
			Tags.combineChampsAndTags(this.tagsObj, true);
			this.items = this.tagsObj.tags; // we only need the actaull tags list
			// this.tagsObj = null; // we no longer need the full object which contains many lists
			this.tagsObj.aliases = null // remove aliases
			this.tagsObj.tags = null; // remove the second "tags" obj/key
			if (this.callback != null)
				this.callback();
		});
	}

	/**
	 * Set a callback method to execute when champions data is loaded.
	 */
	onLoad(callback) {
		if (this.items != null)
			callback();
		else this.callback = callback;
	}
}