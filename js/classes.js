
class ElementPrinter {
	parent;
	elements;
	itemSelector;
	itemHtml;
	templates = {};

	constructor(parentSelector, itemSelector) {
		this.parent = $(parentSelector);
		this.itemSelector = itemSelector;
		if (itemSelector != null)
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

	useTemplate(selector) {
		if (this.templates[selector] == null) {
			this.templates[selector] = $($.parseHTML($(selector)[0].outerHTML));
			this.templates[selector].removeClass("js-template");
		}

		return this.templates[selector].clone();
	}

	useTemplateAsString(selector) {
		if (this.templates[selector] == null) {
			this.templates[selector] = $($.parseHTML($(selector)[0].outerHTML));
			this.templates[selector].removeClass("js-template");
		}

		return this.templates[selector][0].outerHTML;
	}

	static startElement(tagname, more) {
		return `<${tagname} ${more == null ? "" : ` ${more}`}>`;
	}

	static endElemenet(tagname) {
		return `</${tagname}>`;
	}

	static element(tagname, content) {
		return `<${tagname}>${content == null ? "" : content}</${tagname}>`;
	}
}

class Modal {
	html;
	modal;

	constructor() {
		this.html = $("html, body");
		this.modal = $(".modal");

		$(".modal").on("click", () => this.close());
		$(".modal .close").on("click", () => this.close());
		$(".modal-content").on("click", function(event) {
			event.stopPropagation();
		});
	}

	show() {
		this.html.addClass("preventScroll");
		this.modal.addClass("show");
	}

	close() {
		this.modal.removeClass("show");
		this.html.removeClass("preventScroll");
	}

	hasFocus() {
		return this.modal.hasClass("show");
	}
}