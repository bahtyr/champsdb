/**
 * This page is created to keep data manupilation methods separete from unrelated methods.
 * There aren't many methods for Champion object yet, a class for it may be created here when it's necessary.
 */

class TagsEditor {
	data;
	champList = [];
	
	constructor() {
		Tags.loadTags((data) => this.data = data);
		Champion.loadChampions((data, THIS = this) => {
			for (let i in data) THIS.champList.push(data[i].name);
		});
	}

	// CREATE HANDLER

	createTagHandler() {
		let input = textarea.val().split(/\r|\n/);
		if (input == "") return;

		let tagName = input[0].trim();
		let tagId = this.findTagId(tagName);
		let isDuplicate = false;

		if (tagId == -1) {
			tagId = this.createTag(tagName);
			console.warn(`Tag created. ${tagName} # ${tagId}`);
		} else isDuplicate = true;

		switch (input.length) {
			case 1:
				if (isDuplicate) textarea.val(`! Tag ${tagName} already exists with id: ${tagId}`);
				else textarea.val(`${tagName} tag created with id: ${tagId}`);
				break;
			case 2:
				let champs = input[1].split(",");
				for (let i in champs) {
					this.addTagToChampion(champs[i].trim(), tagId);
				}
				console.warn(`Added ${tagName} tag as id#${tagId} to ${champs.length} champion(s).`);
				break;
		}
	}

	createAliasHandler() {
		let input = textarea.val().split(",");
		if (input == "" || input.length != 2) return;

		let isId = isNaN(parseInt(input[0])) ? false : true;

		let alias = input[0].trim();
		let tag = input[1].trim();

		if (alias == tag) {
			console.error(`! Unable to create alias for same tags.`);
			return;
		}

		if (isId) {
			alias = parseInt(alias);
			tag = parseInt(tag);

			if (!this.doesTagIdExist(alias)) {
				console.error(`! Failed to create alias. Alias#${alias} does not exist as a tag.`);
				return;
			}

			if (!this.doesTagIdExist(tag)) {
				console.error(`! Failed to create alias. Tag#${tag} does not exist.`);
				return;
			}
		} else {
			let aliasId = this.findTagId(alias);
			let tagId = this.findTagId(tag);

			if (tagId == -1) {
				console.error(`! Failed to create alias. Tag${tag} does not exist.`)
				return;
			}

			if (aliasId == -1)
				aliasId = this.createTag(alias);

			alias = aliasId;
			tag = tagId;
		}

		// now both alias & tag contain ID values
		
		if (this.doesAliasExist(alias, tag))
			console.error(`! Failed to create alias, it already exists.`);
		else {
			this.createAlias(alias, tag);
		}
	}

	createMissingChampions() {
		for (let i = 0; i < this.champList.length; i++)
			this.createChamp(this.champList[i], i);
		this.printObject();
	}

	// CREATE

	createTag(name) {
		let newId = this.data.tags.length == 0 ? 0 : this.data.tags[this.data.tags.length - 1].id + 1;
		this.data.tags.push({id: newId, name: name});
		return newId;
	}

	createAlias(aliasId, tagId) {
		this.data.aliases.push({tagId: tagId, aliasId: aliasId});
		console.warn(`Alias#${aliasId} created for Tag#${tagId}`);
	}

	addTagToChampion(championName_, tagId) {
		let s = championName_.split("#");
		let championName = s[0];
		let abilityIndex = s.length == 2 ? s[1] : null;

		if (this.data.champs[championName] == null) {
			console.error(`! Failed to add tag#${tagId} to ${championName}. Champion does not exist.`);
			return;
		}

		if (this.data.champs[championName].tagArrays == null) {
			this.data.champs[championName].tagArrays = Array(5);
			for (let i = 0; i < 5; i++)
				this.data.champs[championName].tagArrays[i] = [];
		}


		if (abilityIndex != null) {
			// console.log(championName);
			// console.log(this.data.champs[championName].tagArrays);
			if (!this.data.champs[championName].tagArrays[abilityIndex].includes(tagId))
				this.data.champs[championName].tagArrays[abilityIndex].push(tagId);
			else console.warn(`! Skipped adding tag to champion's ability. ${championName}#${abilityIndex} already has tag#${tagId}`);
		}

		if (abilityIndex == null) {
			if (!this.data.champs[championName].tagArrays[0].includes(tagId))
				this.data.champs[championName].tagArrays[0].push(tagId);
			else console.warn(`! Skipped adding tag to champion. ${championName} already has tag#${tagId}`);
		}
	}

	createChamp(name, index) {
		if (this.data.champs[name] != null) {
			console.error(`! Failed to add champion ${name} to tags' champion list, it already exists.`);
			return 0;
		} else {
			this.data.champs[name] = {index: index, tags: []};
			console.warn(`Champion ${name} added to tags' champion list.`);
			return 1;
		}
	}

	// LOOKUP

	findTagId(name) {
		for (let i = 0; i < this.data.tags.length; i++) {
			if (this.data.tags[i].name.toLowerCase() == name.toLowerCase())
				return this.data.tags[i].id;
		}
		return -1;
	}

	doesTagIdExist(tagId) {
		for (let i in this.data.tags) {
			if (tagId == this.data.tags[i].id)
				return true;
		}
		return false;
	}

	doesAliasExist(aliasId, tagId) {
		for (let i in this.data.aliases) {
			if (aliasId == this.data.aliases[i].aliasId && tagId == this.data.aliases[i].tagId)
				return true;
		}
		return false;
	}

	// PRINT

	printObjectClean() {
		for (let i in tagsEditor.data.tags) {
			delete tagsEditor.data.tags[i].champs;
			delete tagsEditor.data.tags[i].champIndexes;
		}
		this.printObject();
	}

	printObject() {
		textarea.val(JSON.stringify(this.data));
	}

	printTagWithChampions() {
		let s = textarea.val().trim();
		if (s == "" || s.split(/\r|\n/).length > 1) return;
		let matchFound = false;

		for (let i in tagsEditor.data.tags)
			delete tagsEditor.data.tags[i].champs;

		Tags.combineChampsAndTags(this.data);

		for (let i in this.data.tags) {
			if (s == this.data.tags[i].name) {
				if (this.data.tags[i].champs == null)
					console.warn(`! ${s} tag does not contain a champs list.`);
				else textarea.val(`${s}\n${this.data.tags[i].champs.toString()}`)
				matchFound = true;
			}
		}

		if (!matchFound) {
			textarea.val(`! ${s} not found in Tags.`)
		}
	}

	// ETC

	findMenuIds() {
		for (let m in this.data.menu) {
			if (this.data.menu[m].list != null) {
				for (let l in this.data.menu[m].list) {
					if (this.data.menu[m].list[l].text == null) continue;
					for (let t in this.data.tags) {
						if (this.data.tags[t].name == this.data.menu[m].list[l].text) {
							this.data.menu[m].list[l].id = this.data.tags[t].id;
						}
					}
				}
			}
		}
		this.printObject();
	}
}