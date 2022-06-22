class SortManager {
	mode = "name";

	reset() {
		if (this.mode != "name")
			this.byName();
	}

	byName() {
		this.mode = "name";
		champions.sort(ChampionFunctions.compareNames);
		champlist.deselect();
		champlist.print();
	}

	byRelease() {
		this.mode = "release";
		champions.sort(ChampionFunctions.compareReleaseDates);
		champlist.deselect();
		champlist.print();
	}
}