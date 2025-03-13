const apiUrl = "https://kharnyx.glitch.me/";

const tabs = document.querySelectorAll(".tab");
const tabContent = document.querySelectorAll(".tab-content");
const models = document.querySelectorAll(".model");

const modelsContainer = document.querySelector("#models-content .container");
const productInfo = document.getElementById("product-info");
const productInfoImg = document.getElementById("product-info-img");
const openProductPage = document.getElementById("open-project-page");

const commentInput = document.getElementById("sender-comment");
let elementInfo = null;

const contactFormInputs = document.querySelectorAll(
  "#contact-form input, #contact-form textarea"
);
/*
const contactFormSubject = document.getElementById("sender-subject"),
  contactFormEmail = document.getElementById("sender-email"),
  contactFormComment = document.getElementById("sender-comment");

const commentInputHeader = document.getElementById("sender-comment-header");
const clearForm = document.getElementById("clear-form");
const submitForm = document.getElementById("submit-form");
*/
const tabList = ["home", "models"];

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/*
clearForm.addEventListener("click", () => {
  for (let element of contactFormInputs) {
    element.value = "";
  }
  updateCommentInput();
});

submitForm.addEventListener("click", function (event) {
  event.preventDefault();
  if (validateEmail(contactFormEmail.value)) {
    if (contactFormComment.value) {
      if (contactFormSubject.value) {
        let subject = contactFormSubject.value,
          email = contactFormEmail.value,
          comment = contactFormComment.value;

        const emailTo = this.getAttribute("data-email");
        const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(comment)}`;

        // Open the mailto link in the user's default email client
        window.location.href = mailtoLink;
      } else {
        console.log("Please write a name");
      }
    } else {
      console.log("Please write a message");
    }
  } else {
    console.log("Invalid Email Adress");
  }
});

commentInput.addEventListener("input", updateCommentInput(commentInput));

updateTextareaSize(element);

function updateCommentInput(element) {
    element.style.height = "auto";
    element.style.height = `${commentInput.scrollHeight}px`;
  commentInputHeader.innerHTML = `<strong>Comment -</strong> (${
    commentInput.maxLength - commentInput.value.length
  } Characters Left)`;
}
*/

openProductPage.addEventListener("click", () => {
  let url = elementInfo.getAttribute("data-url");
  if (url) window.open(url, "_blank");
});

for (let tab of tabs) {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.hash = tab.getAttribute("href").substring(1);
    changeTabFromURL();
  });
}

for (let model of models) {
  model.addEventListener("click", () => {
    window.location.hash = window.location.hash.substring(1).split("#")[0];
    window.open(model.getAttribute("data-url"), "_blank");
    /*
    window.location.hash = `${
      window.location.hash.substring(1).split("#")[0]
    }${model.getAttribute("href")}`;

    const image = model.querySelector("img");
    productInfoImg.src = image.src;

    elementInfo = model;

    productInfo.querySelector(".container .text-container h2").textContent =
      model.querySelector("h2").textContent;
    productInfo.querySelector(".container .text-container h3").textContent =
      model.querySelector("h3").textContent;

    if (image.complete) {
      modelsContainer.style.display = "none";
      productInfo.style.display = "block";
    } else {
      image.onload = function () {
        modelsContainer.style.display = "none";
        productInfo.style.display = "block";
      };
    }*/
  });
}

function setTabTo(index) {
  let tab = document.getElementById(tabList[index]);

  for (let tab of tabs) {
    tab.classList.remove("active");
    document.getElementById(`${tab.id}-content`).classList.remove("active");
  }

  modelsContainer.style.display = "flex";
  productInfo.style.display = "none";

  tab.classList.add("active");
  document.getElementById(`${tab.id}-content`).classList.add("active");
}

function changeTabFromURL() {
  const hash = window.location.hash.substring(1) || "home";

  if (!window.location.hash.substring(1)) window.location.hash = "home";

  const parts = hash.split("#");

  for (let tab of tabs) {
    tab.classList.remove("active");
  }

  for (let content of tabContent) {
    content.classList.remove("active");
  }

  modelsContainer.style.display = "flex";
  productInfo.style.display = "none";

  if (parts[0]) {
    document.querySelector(`#${parts[0]}`).classList.add("active");
    document.querySelector(`#${parts[0]}-content`).classList.add("active");

    /*
        let headerImage = document.querySelector(`#${parts[0]}-content #header-image`);
        const pageHeaderImage = document.querySelector(".header #page-header-img");
        if (headerImage) {
            pageHeaderImage.style.height = "10rem";
            pageHeaderImage.style.display = "block";
            pageHeaderImage.src = headerImage.getAttribute("data-url");
        } else {
            pageHeaderImage.style.height = "3.5rem";
            pageHeaderImage.style.display = "none";
        }
        */
  }

  if (parts[1]) {
    const model = document.querySelector(`#${parts[0]}`);

    if (model) {
      model.classList.add("active");
    }
  }
}

changeTabFromURL();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    resizeModels();
    window.addEventListener("resize", resizeModels);
  });
} else {
  resizeModels();
  window.addEventListener("resize", resizeModels);
}

function resizeModels() {
  for (let model of models) {
    let img = model.querySelector("img");
    let h3Container = model.querySelector(".h3-container");
    let h2 = model.querySelector("h2");

    h3Container.height = `${model.offsetHeight - img.offsetHeight - h2.offsetHeight}px`;
  }
}