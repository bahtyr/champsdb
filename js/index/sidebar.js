class SidebarManager {

	/****************************************** SHOW HIDE *********************************************/

	toggle(el) {
		el.classList.toggle("active");
		$id("sidebar").classList.toggle("hide");
	}

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
		let taglistContainer = $id("taglist-container");
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

			else if (Array.isArray(element)) {
				item = this.#loopUl(element);
				item.classList.add("sidebar-section");
			}

			item.classList.remove("js-template");
			taglistContainer.appendChild(item);
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

	onClickListItem(target) {
		let tag = this.#findItemPosInMenu(target);
		if (tag.id == -1) return;
		
		window.scrollTo({top: 0});

		if (target.classList.contains("active")) {
			target.classList.remove("active");
			switch (tag.id) {
				case -1: break; //ignore
				case -2: search.queryRemove({key: "region", value: tag.text}, null);   break;
				case -3: search.queryRemove({key: "species", value: tag.text}, null);  break;
				default: search.queryRemove(null, {id: tag.id, name: tag.text}); break;
			}
		} else {
			target.classList.add("active");
			switch (tag.id) {
				case -1: break; //ignore
				case -2: search.queryAdd(target, {key: "region", value: tag.text}, null); break;
				case -3: search.queryAdd(target, {key: "species", value: tag.text}, null); break;
				default: search.queryAdd(target, null, {id: tag.id, name: tag.text, champIndexes: []}); break;
			}
		}
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
			case 2: return menu[pos[0]][pos[1]];
			case 3: return menu[pos[0]][pos[1]][pos[2]];
		}
	}
	
	clearSelection() {
		/* visually deselects active filters */
		$queryAll(".role-icon").forEach(e => e.classList.remove("active"));
	}
}

class FiltersManager {
	roles = {
		onClick: function(target, id, parentId) {
			window.scrollTo({top: 0});

			let attr = parentId === "filter-lane" ? "lanes" : "tags";

			if (target.classList.contains("active")) {
				search.queryRemove({key: attr, value: id}, null);
			} else {
				target.classList.add("active");
				search.queryAdd(target, {key: attr, value: id}, null);
			}
		}
	};

	attributes = {

		/*************************************************************************************************/

		toggleModal: function() {
			$id("attributes-modal").classList.toggle("hide");
		},

		hideModal: function() {
			$id("attributes-modal").classList.add("hide");	
		},

		isOpen: function() {
			return !$id("attributes-modal").classList.contains("hide");
		},

		/*************************************************************************************************/

		queryHasMyAttrs: function() {
			// does not count if the attributes are for champion Lanes or Roles
			for (let q of search.query) { 
				if (q.attr && (q.attr.key != "lanes" && q.attr.key != "tags"))
					return true;
			} return false;
		},

		highlight: function() {
			if (this.queryHasMyAttrs())
				$id("filter-attributes").classList.add("active");
			else $id("filter-attributes").classList.remove("active");
		},

		/*************************************************************************************************/

		onChange: function(el) {
			let tag = null;
			switch(el.id) {
				case "attack-range-ranged": tag = {key: "rangeType",          value: "Ranged"}; break;
				case "attack-range-melee":  tag = {key: "rangeType",          value: "Melee"}; break;
				case "difficulty-1":        tag = {key: "ratings/difficulty", value: 1}; break;
				case "difficulty-2":        tag = {key: "ratings/difficulty", value: 2}; break;
				case "difficulty-3":        tag = {key: "ratings/difficulty", value: 3}; break;
				case "damage-1":            tag = {key: "ratings/damage",     value: 1}; break;
				case "damage-2":            tag = {key: "ratings/damage",     value: 2}; break;
				case "damage-3":            tag = {key: "ratings/damage",     value: 3}; break;
				case "mobility-1":          tag = {key: "ratings/mobility",   value: 1}; break;
				case "mobility-2":          tag = {key: "ratings/mobility",   value: 2}; break;
				case "mobility-3":          tag = {key: "ratings/mobility",   value: 3}; break;
				case "toughness-1":         tag = {key: "ratings/toughness",  value: 1}; break;
				case "toughness-2":         tag = {key: "ratings/toughness",  value: 2}; break;
				case "toughness-3":         tag = {key: "ratings/toughness",  value: 3}; break;
				case "cc-1":                tag = {key: "ratings/control",    value: 1}; break;
				case "cc-2":                tag = {key: "ratings/control",    value: 2}; break;
				case "cc-3":                tag = {key: "ratings/control",    value: 3}; break;
				case "utility-1":           tag = {key: "ratings/utility",    value: 1}; break;
				case "utility-2":           tag = {key: "ratings/utility",    value: 2}; break;
				case "utility-3":           tag = {key: "ratings/utility",    value: 3}; break;
				case "style-1":             tag = {key: "ratings/style",      value: "attack"}; break;
				case "style-2":             tag = {key: "ratings/style",      value: "both"}; break;
				case "style-3":             tag = {key: "ratings/style",      value: "ability"}; break;
				case "damagebreakdown-1":   tag = {key: "ratings/damageBreakdown",    value: "ad"}; break;
				case "damagebreakdown-2":   tag = {key: "ratings/damageBreakdown",    value: "ap"}; break;
				case "damagebreakdown-3":   tag = {key: "ratings/damageBreakdown",    value: "true"}; break;
			}

			if (tag == null) return;

			if (el.checked)
				search.queryAdd(el, tag, null);
			else search.queryRemove(tag);
		},
	};
}