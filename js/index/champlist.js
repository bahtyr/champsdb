class ChampListManager {
	parent = $id("champ-list");
	elements = [];
	visibleItems = [];
	i  = -1; // items index
	ii = -1; // items prev index

	// notes
	// element.children[0].children[2]: ability key

	constructor() {
		/* define a variable to get currently selected champion index */
		Object.defineProperty(window,
			'$champ', { get: () => champlist.safe(champlist.i) }
		);
	}

	/****************************************** PRINT ************************************************/

	print() {
		// reset
		this.i  = -1;
		this.ii = -1;
		this.elements = [];
		this.visibleItems = [];

		// remove any item that is not template 
		// (there are filler items to list width / height && remove existing items when used after sort())
		$queryAll(".item:not(.js-template)").forEach(e => e.remove());

		// prepare item cloning
		const node = $class("item")[0];
		let item;

		champions.forEach((element, index) => {
			item = node.cloneNode(true);
			item.classList.remove("js-template");

			if (element.hide) item.classList.add("hide");
			item.children[0].children[1].src = element.portrait; //img
			item.children[1].textContent = element.name; //text
			
			this.visibleItems.push(!element.hide);
			this.elements.push(item); //keep elements dom to show / hide them directly
			this.parent.appendChild(item);
		});

		// add filler items so the last elements' width don't sace but stay the same
		Array(20).fill(null).forEach(element => {
			element = node.cloneNode(true);
			element.classList.remove("js-template");
			element.classList.add("hidden");	
			this.parent.appendChild(element);
		});

		// show list count
		this.updateItemCount();
	}

	/****************************************** CLICK / SELECT ***************************************/

	onClick(index) {
		this.i = index;
		if (this.i == this.ii && champcard.isOpen())
			this.deselect();
		else this.select();
		this.ii = this.i;
	}

	/**
	 * !! select / deselect methods do not modify indexes, they need to be handled with other methods;
	 * - onClick
	 * - first / next / prev VisibleItem
	 * - unHideAll
	 */

	select() {
		if (!this.elements) return;
		champcard.show();
		champcard.showChamp(this.safe(this.i));
		scroll_.scrollForOverflowingChamp();
		this.elements[this.safe(this.ii)].classList.remove("active");
		this.elements[this.safe(this.i)].classList.add("active");
		this.parent.classList.add("spotlight");
	}

	deselect() {
		if (!this.elements) return;
		champcard.hide();
		this.parent.classList.remove("spotlight");
		this.elements[this.safe(this.i)].classList.remove("active");
	}

	/****************************************** VISIBLE ITEMS ****************************************/

	selectFirstVisibleItem() {
		/* !! this method might not select anything unlike other two methods. */

		// UPDATE: this method no longer actually "select()"s, instead it set indexes to FirstVisibleItem.

		// normally, deselct should be called by the manager class
		// however since this method might jump from any position to index 0,
		// and finding prevIndex can be troublesome if this action is not taken.
		// so prob. deselect will always be used with this method.

		// EDIT 2: abort if last 'index' is visible, continue from there.
		this.deselect();

		if (this.visibleItems[this.i] == true)
			return;
		
		let i = -1;

		do i++;
		while (this.visibleItems[i] == false);

		if (this.visibleItems[i] == true) {
			this.ii = this.i;
			this.i = i;
			// this.select();
			this.ii = this.i;
		}
	}

	selectNextVisibleItem() {
		if (!champcard.isOpen()) {
			this.selectFirstVisibleItem();
			this.select();
			return;
		}

		let i = this.i;

		do i++;
		while (this.visibleItems[i] == false);

		if (this.visibleItems[i] == true) {
			this.ii = this.i;
			this.i = i;
		}

		this.select();
		this.ii = this.i;
	}

	selectPrevVisibleItem() {
		if (!champcard.isOpen()) {
			this.selectFirstVisibleItem();
			this.select();
			return;
		}

		let i = this.i;

		do i--;
		while (this.visibleItems[i] == false);

		if (this.visibleItems[i] == true) {
			this.ii = this.i;
			this.i = i;
		}

		this.select();
		this.ii = this.i;
	}

	/****************************************** SHOW / HIDE CHAMPIONS ********************************/

	show(i) {
		champions[i].hide = false;
		this.visibleItems[i] = true;
		this.elements[i].classList.remove("hide");
		this.elements[i].children[0].children[2].textContent = "";
	}

	hide(i) {
		champions[i].hide = true;
		this.visibleItems[i] = false;
		this.elements[i].classList.add("hide");
		this.elements[i].children[0].children[2].textContent = "";
	}

	unhideAll() {
		if (!this.elements) return;
		champcard.hide();
		this.parent.classList.remove("spotlight");
		this.elements[this.safe(this.i)].classList.remove("active");
		this.i  = -1;
		this.ii = -1;
		this.visibleItems.forEach((e, i) => this.visibleItems[i] = true);
		this.elements.forEach(e => {
			e.classList.remove("hide");
			e.children[0].children[2].textContent = "";
		});

		champions.forEach(e => e.hide = false);
	}

	/**
	 * instead of looping through every champion and checking if it matches search criteria every time before hiding,
	 * this method;
	 * - loops visible items
	 *    - set them as false by default
	 *    - set true every item in given indexes[] 
	 *    - then use show/hide(index) method 
	 */
	hideAllExcept(indexArr, keepHiddenHidden) {
		if (typeof indexArr == "number") indexArr = [indexArr]; // convert this to an array for easier handling

		console.log(keepHiddenHidden);
		// !keepHiddenHidden &&
		// if (!keepHiddenHidden)

		if (keepHiddenHidden) {

			let temp = Array(this.visibleItems.length).fill(false);
			indexArr.forEach(e => temp[e] = true);

			console.log(this.visibleItems);

			this.visibleItems.forEach((boo, i) => {
				console.log(`${boo}  ${temp[i]}`)
				if (boo && temp[i]) 
					this.visibleItems[i] = true;
				else this.visibleItems[i] = false;
			})

			// indexArr.forEach(e => {
				// this.visibleItems[e] = this.visibleItems[e] ? true : false;
			// });
			this.visibleItems.forEach((visibility, i) => visibility ? champlist.show(i) : champlist.hide(i));

			return;
		}

		this.visibleItems.fill(false);
		indexArr.forEach(e => this.visibleItems[e] = true);
		this.visibleItems.forEach((visibility, i) => visibility ? champlist.show(i) : champlist.hide(i));
	}

	resetPosition() {
		this.i  = -1;
		this.ii = -1;
	}

	/****************************************** ETC **************************************************/

	safe(i) {
		/* returns a safe number without changing index vars */
		if (i < 0) return 0;
		if (i >= this.visibleItems.length)
			return this.visibleItems.length - 1;
		return i;
	}

	updateItemCount() {
		/* diplay count of visible items after a filter is applied */
		$id("search__count").textContent = this.visibleItems.filter(e => e == true).length + " Champions";
	}

	showAbilityKeysOnChamps() {
		let tags_ = search.queryTags();
		let searchHasTags = tags_.length > 0;

		this.visibleItems.forEach((visible, i) => {
			if (visible && searchHasTags) {
				let s = "";
				s += champions[i].tagArrays[1].some(t => tags_.includes(t)) ? "P" : "";
				s += champions[i].tagArrays[2].some(t => tags_.includes(t)) ? "Q" : "";
				s += champions[i].tagArrays[3].some(t => tags_.includes(t)) ? "W" : "";
				s += champions[i].tagArrays[4].some(t => tags_.includes(t)) ? "E" : "";
				s += champions[i].tagArrays[5].some(t => tags_.includes(t)) ? "R" : "";
				this.elements[i].children[0].children[2].textContent = s.split("").join(" ");
			}

			else this.elements[i].children[0].children[2].textContent = "";
		});
	}

	exportVisibleItems(mode = "export-name-only") {
		if (!champlist.elements) return;
		let arr = [];

		// name only
		if (mode === "export-name-only") {
			champions.forEach(champ => !champ.hide && arr.push(champ.name));
		}

		else if (mode === "export-with-keys") {

			let queryHasTags = false;
			for (let obj of search.query) {
				if (obj.tag || obj.attr) queryHasTags = true;
			}

			// only visibile abilities
			if (queryHasTags) {
				champions.forEach((champ, i) => {
					if (!champ.hide) {
						let keys = this.elements[i].children[0].children[2].textContent.trim();
						if (keys.length == 0) {
							arr.push(champ.name + " (P)");
							arr.push(champ.name + " (Q)");
							arr.push(champ.name + " (W)");
							arr.push(champ.name + " (E)");
							arr.push(champ.name + " (R)");
						} else keys.split(" ").forEach(key => arr.push(`${champ.name} (${key})`));
					}
				});
			}

			// all abilities
			else {
				champions.forEach((champ, i) => {
					if (!champ.hide) {
						arr.push(champ.name + " (P)");
						arr.push(champ.name + " (Q)");
						arr.push(champ.name + " (W)");
						arr.push(champ.name + " (E)");
						arr.push(champ.name + " (R)");
					}
				});
			}
		}

		navigator.clipboard.writeText(arr.join('\r\n'));
		alert.show();
	}
}