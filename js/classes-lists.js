
class ChampionListManager {
	items;
	visibleItems = [];
	i = -1;  // items index
	ii = -1; // items prev index
	v = -1;  // visible items index
	callback;

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
}

class TagsListManager {
	tagsObj;
	items;

	constructor() {
		Tags.loadTags((data) => {
			this.tagsObj = data;
			Tags.combineChampsAndTags(this.tagsObj, true);
			this.items = this.tagsObj.tags; // we only need the actaull tags list
			this.tagsObj = null; // we no longer need the full object which contains many lists
		});
	}
}