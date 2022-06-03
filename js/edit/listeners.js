/****************************************** CHAMP FIELDS ********************************************/

$id("champ-block-data").addEventListener("click", e => {
	// loop parent nodes from the target to the delegation node
	for (let target = e.target; target != e.currentTarget && target && target != this; target = target.parentNode) {
		if (target && target.matches(".collapsible-header")) {
			// onclick
			target.classList.toggle("active");
		    var content = target.nextElementSibling;
		    if (content.style.display === "block") {
		      content.style.display = "none";
		    } else {
		      content.style.display = "block";
		    }
			console.log("hellos")
			// champlist.onClick($index(target, -1));
			break;
		}
	}
});