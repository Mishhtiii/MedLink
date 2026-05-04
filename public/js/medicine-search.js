document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("medicine-search-input");
    const searchButton = document.getElementById("medicine-search-button");
    const searchDialog = document.getElementById("search-dialog");
    const searchResultsList = document.getElementById("search-results-list");
    const searchDialogClose = document.getElementById("search-dialog-close");
    const medicineCards = Array.from(document.querySelectorAll(".product-card"));

    function openDialog() {
        searchDialog.style.display = "block";
    }

    function closeDialog() {
        searchDialog.style.display = "none";
        searchResultsList.innerHTML = "";
        searchInput.value = "";
    }

    function scrollToMedicine(medicineName) {
        const card = medicineCards.find(card => card.getAttribute("data-name").toLowerCase() === medicineName.toLowerCase());
        if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            closeDialog();
        }
    }

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        searchResultsList.innerHTML = "";

        if (!query) {
            return;
        }

        const matchedMedicines = medicineCards.filter(card => {
            const name = card.getAttribute("data-name").toLowerCase();
            return name.includes(query);
        });

        if (matchedMedicines.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No medicines found.";
            searchResultsList.appendChild(li);
        } else {
            matchedMedicines.forEach(card => {
                const name = card.getAttribute("data-name");
                const li = document.createElement("li");
                li.textContent = name;
                li.style.cursor = "pointer";
                li.addEventListener("click", () => {
                    scrollToMedicine(name);
                });
                searchResultsList.appendChild(li);
            });
        }

        openDialog();
    }

    searchButton.addEventListener("click", performSearch);

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    searchDialogClose.addEventListener("click", closeDialog);
    window.addEventListener("click", (event) => {
        if (event.target === searchDialog) {
            closeDialog();
        }
    });
});
