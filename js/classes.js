
class ElementPrinter {
	parent;
	items;
	itemSelector;
	itemHtml;

	constructor(parent, item) {
		this.parent = $(parent);
		this.itemSelector = item;
		this.itemHtml = this.parent.find(item)[0].outerHTML;
	}

	addAll(elementCount, init) {
		if (elementCount == null || elementCount == 0 || init == null) return;
		let arr = []
		for (let i = 0; i < elementCount; i++) {
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

	removaAllItems() {
		this.items = null;
		this.parent.find(`${this.itemSelector}:not(.js-template)`).remove();
	}

	removaAllHiddenItems() {
		this.parent.find(".hidden").remove();
	}
}