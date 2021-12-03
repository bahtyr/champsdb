class ElementPrinter {
	parent;
	items;
	itemSelector;
	itemHtml;

	constructor(parent, item) {
		this.parent = $(parent);
		this.itemSelector = item;
		this.itemHtml = $(item)[0].outerHTML;
	}

	addAll(items, init) {
		if (items == null || init == null) return;
		let arr = []
		for (let i in items) {
			let holder = $($.parseHTML(this.itemHtml));
			holder.removeClass("js-template");
			init(holder, i);
			arr.push(holder);
		}
		this.parent.append(arr);
		this.items = $(this.itemSelector);
	}

	addSpaceItems(count) {
		let arr = []
		for (let i = 0; i < count; i++) {
			let holder = $($.parseHTML(this.itemHtml));
			holder.removeClass("js-template");
			holder.addClass("hidden");
			arr.push(holder);
		}
		this.parent.append(arr);
	}
}

class ChampsList {
	#PATH_CHAMPS = "data.json";
	items;
	visibleItems = [];
	i = -1; // items index
	ii = -1; // items prev index
	v = -1; // visible items index

	constructor() { }

	load(callback, context = this) {
		$.ajax({
	  		type: "GET",
			url: this.#PATH_CHAMPS,
			dataType: "json",
			success: function(data, textStatus) {
				context.items = data;
				if (callback != null)
					callback();
			},
			error: function(textStatus, errorThrown) {
				console.log(errorThrown);
			}
		});
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

	static findChampIndex(champList, champName) {
		for (let i = 0; i < champList.length; i++) {
			if (champName == champList[i].name) {
				return i;
			}
		}
	}
}

class ChampTags {
	#PATH_TAGS = "data-tags.json";
	items;	// {id, name, champs{}}
	tagMap;	// [{tagId, champId}]
	#champNamePairStatus = 0;

	constructor() { }

	load(callback, context = this) {
		$.ajax({
	  		type: "GET",
			url: this.#PATH_TAGS,
			dataType: "json",
			success: function(data, textStatus) {
				// console.log(data);
				context.items = data.items;
				context.tagMap = data.tagMap;
				if (callback != null)
					callback();
			},
			error: function(textStatus, errorThrown) {
				console.log(errorThrown);
			}
		});
	}

	clearChampsFromTags() {
		for (let i = 0; i < this.items.length; i++) {
			delete this.items[i].champs;
		}

		this.#champNamePairStatus = 0;
	}

	putChampNamesToTags() {
		if (this.#champNamePairStatus == 1) return;
		this.#champNamePairStatus = 1;

		for (let i = 0; i < this.items.length; i++)
			delete this.items[i].champs;

		for (let i = 0; i < this.tagMap.length; i++) { // loop tagId & champName pairs
			for (let ii = 0; ii < this.items.length; ii++) { // find the tagId
				if (this.tagMap[i].tagId == this.items[ii].id) {
					if (this.items[ii].champs == null) this.items[ii].champs = [];
					this.items[ii].champs.push(this.tagMap[i].champName); // add the champ to the tag
					break;
				}
			}
		}
	}

	putChampIndexesToTags(champList) {
		if (this.#champNamePairStatus == 2) return;
		this.#champNamePairStatus = 2;

		for (let i = 0; i < this.items.length; i++)
			delete this.items[i].champs;

		for (let i = 0; i < this.tagMap.length; i++) { // loop tagId & champName pairs
			for (let ii = 0; ii < this.items.length; ii++) { // find the tagId
				if (this.tagMap[i].tagId == this.items[ii].id) {
					if (this.items[ii].champs == null) this.items[ii].champs = [];
					this.items[ii].champs.push(ChampsList.findChampIndex(champList, this.tagMap[i].champName)); // add the champ to the tag
					break;
				}
			}
		}
	}
}