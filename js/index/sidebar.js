class SidebarManager {

	/****************************************** SHOW HIDE *********************************************/

	show() {
		$id("sidebar").classList.add("show");
		$id("sidebar__content-overlay").classList.add("show");
		$tag("html")[0].classList.add("preventScroll");
		$tag("body")[0].classList.add("preventScroll");
	}

	hide() {
		$id("sidebar").classList.remove("show");
		$id("sidebar__content-overlay").classList.remove("show");
		$tag("html")[0].classList.remove("preventScroll");
		$tag("body")[0].classList.remove("preventScroll");
	}

	/****************************************** PRINT ************************************************/

	print() {
		const nodeH = $class("sidebar-heading")[0];
		const nodeS = $class("sidebar-subheading")[0];
		let filtersWrapper = $id("filters-wrapper");
		let item;

		menu.forEach(element => {
			
			if (element.heading) {
				item = nodeH.cloneNode(true);
				item.textContent = element.heading;
			}

			else if (element.subheading) {
				item = nodeS.cloneNode(true);
				item.children[1].textContent = element.subheading;
			}

			else if (element.list) {
				item = this.#loopUl(element.list);
				item.classList.add("sidebar-section");
			}

			item.classList.remove("js-template");
			filtersWrapper.appendChild(item);
		});
	}

	#nodeLI = $class("sidebar-list-item")[0];
	#createLi(element) {
		let item = this.#nodeLI.cloneNode(true);
		item.classList.remove("js-template");
		item.children[0].textContent = element.tooltip;
		item.children[1].textContent = element.text;
		return item;
	}

	#loopUl(list) {
		let node_ = document.createElement("ul");
		list.forEach(element => {
			if (Array.isArray(element))
				node_.appendChild(this.#loopUl(element));
			else node_.appendChild(this.#createLi(element));
		});
		return node_;
	}

	/****************************************** ONCLICK **********************************************/
	
	onClickRole(target, id, parentId) {
		window.scrollTo({top: 0});
		champlist.deselect();

		// if clicking on the same filter
		if (target.classList.contains("active")) {
			target.classList.remove("active");
			search.clear();
			return;
		}

		// clear / add active effects
		$queryAll(".sidebar__role-icon").forEach(e => e.classList.remove("active"));
		target.classList.add("active");

		// search
		let attr = parentId === "filter-lane" ? "lanes" : "tags";
		search.byAttr(attr, id);
		search.fakeInput(id);
		champlist.updateItemCount();
	}

	onClickListItem(target) {
		let tag = this.#findItemPosInMenu(target);
		if (tag.id == -1) return;
		
		window.scrollTo({top: 0});
		this.clearSelection();
		champlist.unhideAll();
		search.fakeInput(tag.text);

		switch (tag.id) {
			case -1: break; //ignore
			case -2: search.byAttr("region", tag.text); break;
			case -3: search.byAttr("species", tag.text); break;
			default: search.byTagId(tag.id); break;
		}

		champlist.updateItemCount();
	}

	onClickSubheading(target) {
		/* Toggle the next ul.section's maxHeight from 0 to maxHeight */ 
		let content = target.nextElementSibling;
		if (content.style.maxHeight)
			content.style.maxHeight = null;
		else content.style.maxHeight = content.scrollHeight + "px";
	}

	/****************************************** ETC **************************************************/

	#findItemPosInMenu(el) {
		let pos = [];
		while (!el.matches(".sidebar-section")) {
			pos.push($index(el));
			el = el.parentNode;
		}
		pos.push($index(el, -4));
		pos = pos.reverse();

		switch (pos.length) {
			case 2: return menu[pos[0]].list[pos[1]];
			case 3: return menu[pos[0]].list[pos[1]][pos[2]];
		}
	}
	
	clearSelection() {
		/* visually deselects active filters */
		$queryAll(".sidebar__role-icon").forEach(e => e.classList.remove("active"));
	}	
}