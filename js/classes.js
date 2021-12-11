
class ElementPrinter {
	parent;
	elements;
	itemSelector;
	itemHtml;

	constructor(parentSelector, itemSelector) {
		this.parent = $(parentSelector);
		this.itemSelector = itemSelector;
		this.itemHtml = this.parent.find(itemSelector)[0].outerHTML;
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
		this.elements = $(this.itemSelector);
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
		this.elements = null;
		this.parent.find(`${this.itemSelector}:not(.js-template)`).remove();
	}
}