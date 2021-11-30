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
}