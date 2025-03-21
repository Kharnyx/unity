if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
} else {
    setup();
}

function setup() {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");
    const previewBtns = document.querySelectorAll(".preview-btn");
    const openAssetStoreBtns = document.querySelectorAll(".open-asset-store");
    const model = document.getElementById("model-preview");
    const modelContent = document.getElementById("preview-content");
    const closeModel = document.querySelector(".close");
    const featuredAssets = document.querySelectorAll(".featured");
    const buttons = document.querySelectorAll("button");

    for (let tab of tabs) {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");

            if (tab.classList.contains("active")) return;

            for (let content of contents) {
                content.style.display = "none";
            }

            for (let t of tabs) {
                t.classList.remove("active");
            }

            document.getElementById(targetTab).style.display = "block";
            tab.classList.add("active");
            document.location.hash = `${tab.getAttribute("data-hash").toLocaleLowerCase()}`;

            let body = document.documentElement;
            if (body.scrollTop != "0") {
                body.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        });
    }

    for (let btn of previewBtns) {
        btn.addEventListener("click", () => {
            model.style.display = "block";
            modelContent.querySelector("img").src = btn.getAttribute("data-src");
            modelContent.innerHTML = "<p>Loading preview...</p>";
        });
    }

    for (let btn of buttons) {
        const span = document.createElement("span");
        span.id = "btn-text-content";

        btn.appendChild(span);

        let text = btn.textContent || btn.innerText;

        for (let node of btn.childNodes) {
            if (node.nodeTyoe = Node.TEXT_NODE) {
                node.remove();
            }
        }

        span.textContent = text;
    }

    for (let btn of openAssetStoreBtns) {
        btn.addEventListener("click", () => {
            let url = btn.getAttribute("data-url");
            if (url) window.open(url, "_blank");
        });
    }

    closeModel.addEventListener("click", () => {
        model.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === model) {
            model.style.display = "none";
        }
    });

    const hash = document.location.hash.substring(1);

    if (!window.location.hash.substring(1)) {
        document.querySelector(".tab").click();
    } else {
        const parts = hash.split('#');

        for (let tab of tabs) {
            tab.classList.remove("active");
        }

        let completed = false;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i]) {
                for (let tab of tabs) {
                    if (tab.getAttribute("data-hash") === parts[i]) {
                        tab.click();
                        completed = true;
                        break;
                    }
                }

                if (!completed) document.querySelector(".tab").click();
                else break;
            }
        }
    }

    for (let asset of featuredAssets) {
        const h2 = document.createElement("h2");
        h2.textContent = "FEATURED";

        asset.prepend(h2);

        const container = document.createElement("div");
        container.className = "asset-container featured";

        asset.parentNode.insertBefore(container, asset);
        container.appendChild(asset);
    }

    window.addEventListener("scroll", () => {
        const tabContainer = document.querySelector(".tabs");
        const header = document.querySelector("header");
        const headerRect = header.getBoundingClientRect();
        const tabRect = tabContainer.getBoundingClientRect();
        const top = tabRect.top;

        if (top <= 0 && headerRect.bottom <= 0) {
            tabContainer.style.position = "fixed";
            document.querySelector(".tab-container").style.height = `${tabContainer.offsetHeight}px`;
        }

        if (headerRect.bottom > top) {
            tabContainer.style.position = "unset";
        }
    });

    document.getElementById("email").addEventListener("click", () => {
        window.location.href = "mailto:kharnyx3@gmail.com";
    });

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
        submitBtn.addEventListener("click", function (event) {
            event.preventDefault();
            let name = document.getElementById("contact-name").value;
            let message = document.getElementById("contact-message").value;

            if (name && message) {
                const recipientEmail = "kharnyx3@gmail.com";
                const subject = `Customer Support Ticket - ${name}`
                const body = message;
                window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        });
    }

    const assetSearch = document.getElementById("asset-search-input");
    assetSearch.addEventListener("input", () => {
        const assets = document.querySelectorAll(".asset-item");
        let searched = assetSearch.value;

        if (!searched) {
            for (let asset of assets) {
                asset.style.display = "block";
            }

            return;
        }

        for (let asset of assets) {
            let searchName = asset.querySelector(".asset-info .title").textContent;

            let terms = searched.split(' ').filter(Boolean);
            let assetTerms = searchName.split(' ').filter(Boolean)

            for (let i = 0; i < terms.length; i++) {
                if (searchName.toLocaleLowerCase().includes(terms[i].toLocaleLowerCase())) {
                    asset.style.display = "block";
                    break;
                } else {
                    asset.style.display = "none";
                }
            }

            /*
            let found = false;
            for (let i = 0; i < assetTerms.length; i++) {
                for (let j = 0; j < terms.length; j++) {
                    console.log(assetTerms[i]);
                    console.log(terms[j])
                    if (assetTerms[i].toLocaleLowerCase() == terms[j].toLocaleLowerCase()) {
                        asset.style.display = "block";
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            */
        }
    });
}
