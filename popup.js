"use strict";


//fake state
let nurtureItems = [
  // {
  //   id: 0,
  //   action: "000",
  //   percent: 64,
  //   goal: "like",
  //   reason: "The burn in my arms feels like progress",
  //   log: ["veryTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "neutral", "neutral", "mostlyNotTrue", "notTrue"]
  // },
  // {
  //   id: 1,
  //   action: "111",
  //   percent: 64,
  //   goal: "like",
  //   reason: "The burn in my arms feels like progress",
  //   log: ["veryTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "mostlyTrue", "neutral", "neutral", "mostlyNotTrue", "notTrue"]
  // }
];
let activeItemId = null;
let maxDotsToShow = 20;
let showIntroModule = true;
let removeIsActive = false;
let userVersion = "1.2.3";
let intensity = "likeDislike";


/***************************/
/***** EVENT LISTENERS *****/
/***************************/

//click a specific item
const onClickOpenItem = e => {
  
  
  let itemId = e.target.id;
  let classNames = e.target.className;
  if (itemId === "default") { return }
  if (itemId === null || itemId === "" || itemId === undefined) {
    return;
  }

  if (classNames.includes("showRemove")) {
    removeItemFromList(itemId);
    return;
  }
  loadPage("item", itemId);
}
document.querySelector(".nurtureItemList").addEventListener("click", onClickOpenItem);


const runBootstrapProcess = () => {

  const onBackButtonClick = () => {
    loadPage("home");
  }
  const onCloseButtonClick = () => {
    window.close();
  }
  const onAboutPageClick = () => {
    loadPage("about")
  }
  const onIntroButtonClick = () => {
    showIntroModule = false;
    loadPage("home");
    updateStorage(["showIntroModule"]);
  }
  const onHeaderDeleteButtonClick = () => {
    toggleRemoveButtons();
  }
  const onFaceClick = (e) => {
    let targetId = e.target.id;
    if (targetId === "notTrue" ||
      targetId === "mostlyNotTrue" ||
      targetId === "neutral" ||
      targetId === "mostlyTrue" ||
      targetId === "veryTrue") {
      faceClick(targetId);
    }
  }

  document.querySelectorAll(".back")
    .forEach(backButton => backButton
      .addEventListener("click", onBackButtonClick)
    );
  document.querySelectorAll(".close")
    .forEach(closeButton => closeButton
      .addEventListener("click", onCloseButtonClick)
    );
  document.querySelector(".about")
    .addEventListener("click", onAboutPageClick);
  document.querySelector(".introButton")
    .addEventListener("click", onIntroButtonClick)
  document.querySelector(".delete")
    .addEventListener("click", onHeaderDeleteButtonClick);
  document.querySelector(".faces")
    .addEventListener("click", onFaceClick);
}

//form
const newItemFormToggleLike = () => {
  formGoalToggle("like");
}
document.querySelector(".toggleLike")
  .addEventListener("click", newItemFormToggleLike);

const newItemFormToggleDislike = () => {
  formGoalToggle("dislike");
}
document.querySelector(".toggleDislike")
  .addEventListener("click", newItemFormToggleDislike);


//FORM
const submitForm = (event) => {
  event.preventDefault();
  let goal = event.target.goal.value;
  let action = event.target.action.value;
  let reason = event.target.reason.value;
  newItem(goal, action, reason);
  event.srcElement.reset();
}
document.querySelector("form")
  .addEventListener("submit", submitForm)


//INTENSITY MODES
const turnIntensityToLikeDislike = () => {
  intensityToggle("likeDislike");
}
const turnIntensityToLoveHate = () => {
  intensityToggle("loveHate");
}
document.querySelector(".toggleLikeDislike")
  .addEventListener("click", turnIntensityToLikeDislike);

document.querySelector(".toggleLoveHate")
  .addEventListener("click", turnIntensityToLoveHate);



/*******************/
/*** FUNCTIONS *****/
/*******************/

const loadPageHome = () => {
  showPageById(pageIdsDictionary.home)
  refreshList();
}
const loadPageItem = ({ itemId }) => {
  showPageById(pageIdsDictionary.item)
  displayItem(itemId);
}
const loadPageAddNew = () => {
  showPageById(pageIdsDictionary.addNew)
}
const loadPageAbout = () => {
  showPageById(pageIdsDictionary.about)
}
const loadPageIntro = () => {
  showPageById(pageIdsDictionary.intro)
}

const pageIdsDictionary = {
  home: {
    tagId: "#homeModule",
    onSelectHandler: loadPageHome,
  },
  item: {
    tagId: "#itemModule",
    onSelectHandler: loadPageItem,
  },
  addNew: {
    tagId: "#addNewModule",
    onSelectHandler: loadPageAddNew,
  },
  about: {
    tagId: "#aboutModule",
    onSelectHandler: loadPageAbout,
  },
  intro: {
    tagId: "#introModule",
    onSelectHandler: loadPageIntro,
  },
}

const showPageById = ({ tagId }) => document.querySelector(tagId).classList.remove("hide")
const hidePageById = ({ tagId }) => document.querySelector(tagId).classList.add("hide")
const hideAllPages = () => Object.values(pageIdsDictionary).forEach(hidePageById)

function loadPage(page, itemId) {
  resetHomePage();
  resetItemPage()
  hideAllPages()

  activeItemId = null;
  const currentPageIdsDictionaryEntry = pageIdsDictionary[page] || pageIdsDictionary.home

  currentPageIdsDictionaryEntry.onSelectHandler({ itemId })
}

const nurtureItemMarkupBuilder = (listHTMLResult, nurtureItem) => listHTMLResult +
  `<p id=${nurtureItem.id} class="${nurtureItem.goal} ${removeIsActive ? "showRemove" : ""}">
          <span class="remove"> - </span>
          ${nurtureItem.action}
          <span class="percent">${nurtureItem.percent}%</span>
  </p>`

const defaultNurtureItemMarkup = "";
const addNewLight = `<p class="addNew">+ new</p>`;
const addNewDark = `<p class="addNew darker">+ new</p>`;

function refreshList() {
  resetHomePage();
  let list = document.querySelector(".nurtureItemList");
  const listHTML = nurtureItems.length !== 0
    ? nurtureItems.reduce(nurtureItemMarkupBuilder, '')
    : defaultNurtureItemMarkup;
  const addNewHTML = nurtureItems.length !== 0
    ? addNewLight
    : addNewDark
  
  list.insertAdjacentHTML("afterbegin", addNewHTML);
  list.insertAdjacentHTML("afterbegin", listHTML);
  reattachAddNewListener();
}

const addIdValuesToItems = (nurtureItem, nurtureItemIndex) => ({
  ...nurtureItem,
  id: nurtureItemIndex
})


function removeItemFromList(itemId) {

  nurtureItems = nurtureItems
    .filter( item => item.id != itemId)

  if (nurtureItems.length === 0) toggleRemoveButtons();
  updateStorage(["nurtureItems"]);
  refreshList();
}

const setToggleRemoveVisibility = (newActiveState = false) => {
  const deleteButtonDomElementClassList = document.querySelector(".delete").classList
  newActiveState ? deleteButtonDomElementClassList.add("active") : deleteButtonDomElementClassList.remove("active")
}

function toggleRemoveButtons() {
  removeIsActive = !removeIsActive;
  setToggleRemoveVisibility(removeIsActive)
  refreshList();
}

function getItemFromNurtureItemsList(itemId){
  let item;
  nurtureItems.forEach( nurtureItem => {
    if (nurtureItem.id === itemId){
      item = nurtureItem;
    }
  });
  return item; 
}

function displayItem(itemId) {
  activeItemId = itemId;
  let item = getItemFromNurtureItemsList(itemId);
  console.log("--- after loop, item is : ", item);
  document.querySelector("#itemModule .displayPercent").innerHTML = `${item.percent}%`;
  document.querySelector("#itemModule .displayAction").innerHTML = `I ${item.goal} ${item.action}`;
  document.querySelector("#itemModule .displayReason").innerHTML = `${item.reason}`;


  if (item.goal === "hate" || item.goal === "dislike"){
    document.querySelector("#notTrue img").src = "/images/dislike-notTrue.svg";
    document.querySelector("#mostlyNotTrue img").src = "/images/dislike-mostlyNotTrue.svg";
    document.querySelector("#neutral img").src = "/images/neutral.svg";
    document.querySelector("#mostlyTrue img").src = "/images/dislike-mostlyTrue.svg";
    document.querySelector("#veryTrue img").src = "/images/dislike-veryTrue.svg";
  }
  else {
    document.querySelector("#notTrue img").src = "/images/like-notTrue.svg";
    document.querySelector("#mostlyNotTrue img").src = "/images/like-mostlyNotTrue.svg";
    document.querySelector("#neutral img").src = "/images/neutral.svg";
    document.querySelector("#mostlyTrue img").src = "/images/like-mostlyTrue.svg";
    document.querySelector("#veryTrue img").src = "/images/like-veryTrue.svg";
  }

  displayDots(itemId)
  updatePercent(itemId);
}

function displayDots(itemId) {
  resetDots();
  let opacity = 100;

  let opacityReducer = 100 / maxDotsToShow;
  if (maxDotsToShow <= 5) opacityReducer = 5;

  let item = getItemFromNurtureItemsList(itemId);
  document.querySelector("#itemModule").classList.add(`${item.goal}`)
  for (var i = 0; i < item.log.length; i++) {
    if (i > maxDotsToShow - 1) return;
    let faceToAddTo = document.querySelector(`.face.${item.log[i]} .dots`);
    if (i === 0) {
      faceToAddTo.insertAdjacentHTML("afterbegin", `<div class="dot newest" style="opacity:${opacity / 100}"></div>`);
    }
    else {
      faceToAddTo.insertAdjacentHTML("beforeend", `<div class="dot" style="opacity:${opacity / 100}"></div>`);
    }
    if (opacity > 10) {
      opacity -= opacityReducer;
    }
  }
}

function updatePercent(itemId) {

  let percent = 0;
  let faceValue = 25 / maxDotsToShow;
  let item = getItemFromNurtureItemsList(itemId);

  for (let i = 0; i < item.log.length; i++) {
    if (i < maxDotsToShow) {
      switch (item.log[i]) {
        case "veryTrue":
          percent += faceValue * 4;
          break;
        case "mostlyTrue":
          percent += faceValue * 3;
          break;
        case "neutral":
          percent += faceValue * 2;
          break;
        case "mostlyNotTrue":
          percent += faceValue;
          break;
        default:
          break;
      }
    }
  }
  percent = Math.round(percent);
  item.percent = percent;

  document.querySelector(".displayPercent").innerHTML = `${percent}%`;
}

function faceClick(faceId) {
  let item = getItemFromNurtureItemsList(activeItemId);
  item.log.unshift(faceId);
  displayItem(activeItemId);
  updateStorage(["nurtureItems"]);
}

function formGoalToggle(goal) {
  if (goal === "like") {
    document.querySelector(".toggleLike").classList.add("active");
    document.querySelector(".toggleDislike").classList.remove("active");
    document.querySelector(".actionInput").placeholder = "ie. eating vegetables";
    if (intensity === "likeDislike"){
      document.querySelector(".actionLabel").innerHTML = "I'm learning to like...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to like?";
      document.querySelector(".goalResult").value = "like";
    } else {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to love...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to love?";
      document.querySelector(".goalResult").value = "love";
    }
    document.querySelector(".reasonInput").placeholder = "ie. I feel healthy";

  }
  else if (goal === "dislike") {
    document.querySelector(".toggleLike").classList.remove("active");
    document.querySelector(".toggleDislike").classList.add("active");
    document.querySelector(".actionInput").placeholder = "ie. social media";
    if (intensity === "likeDislike") {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to dislike...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to dislike?";
      document.querySelector(".goalResult").value = "dislike";
    } else {
      document.querySelector(".actionLabel").innerHTML = "I'm learning to hate...";
      document.querySelector(".reasonLabel").innerHTML = "What about it do you want to hate?";
      document.querySelector(".goalResult").value = "hate";
    }
    document.querySelector(".reasonInput").placeholder = "ie. Feels like a waste of time";
  }
}


function intensityToggle(res) {

  if (res === "likeDislike") {
    intensity = "likeDislike";
    document.querySelector(".toggleLikeDislike").classList.add("active");
    document.querySelector(".toggleLoveHate").classList.remove("active");
    document.querySelector(".toggleLike").innerHTML = "LIKE";
    document.querySelector(".toggleDislike").innerHTML = "DISLIKE";
    for (var i = 0; i < nurtureItems.length; i++) {
      let goal = nurtureItems[i].goal;
      if (goal === "love" || goal === "like") {
        nurtureItems[i].goal = "like"
      }
      else if (goal === "hate" || goal === "dislike"){
        nurtureItems[i].goal = "dislike"
      }
    }
  }
  else if (res === "loveHate"){
    intensity = "loveHate";
    document.querySelector(".toggleLoveHate").classList.add("active");
    document.querySelector(".toggleLikeDislike").classList.remove("active");
    document.querySelector(".toggleLike").innerHTML = "LOVE";
    document.querySelector(".toggleDislike").innerHTML = "HATE";
    for (var i=0;i<nurtureItems.length;i++){
      let goal = nurtureItems[i].goal;
      if (goal === "love" || goal === "like") {
        nurtureItems[i].goal = "love";
      }
      else if (goal === "hate" || goal === "dislike") {
        nurtureItems[i].goal = "hate"
      }
    }
  }
  formGoalToggle("like"); //update values there to match
  updateStorage(["intensity"]);
}

function newItem(goal, action, reason) {
  let id = getNewItemId();
  let item = {
    id: id,
    action: action,
    percent: 0,
    goal: goal,
    reason: reason,
    log: [],
  }
  nurtureItems.push(item);
  updateStorage(["nurtureItems"]);
  loadPage("home");
}

function getNewItemId() {
  var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return id;
}

function updateStorage(toUpdate) {

  if (toUpdate.includes("nurtureItems") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      nurtureItems: nurtureItems
    }, function () {});
  }

  if (toUpdate.includes("showIntroModule") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      showIntroModule: showIntroModule
    }, function () {});
  }

  if (toUpdate.includes("userVersion") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      userVersion: userVersion
    }, function () {});
  }

  if (toUpdate.includes("intensity") || toUpdate.includes("all")) {
    chrome.storage.sync.set({
      intensity: intensity
    }, function () {});
  }

}

function updateDataFromStorage() {

  chrome.storage.sync.get('nurtureItems', function (result) {
    if (result.nurtureItems) {
      nurtureItems = result.nurtureItems;
      refreshList();
    }
  });
  chrome.storage.sync.get('intensity', function (result) {

    if (result.intensity) {
      intensity = result.intensity;
      intensityToggle(intensity);
    }
  });
}

function getIntroFromStorage() {
  chrome.storage.sync.get('showIntroModule', function (result) {

    if (result.showIntroModule !== undefined) {
      showIntroModule = result.showIntroModule;
    }
    if (showIntroModule) {
      loadPage("intro");
    }
    else {
      loadPage("home");
    }
  });
}

chrome.storage.onChanged.addListener(refreshList)


/*******************/
/*** RESETS *****/
/*******************/

function resetHomePage() {
  // document.querySelector(".nurtureItemList").remove();
  // document.querySelector("#homeModule .body").insertAdjacentHTML("afterbegin", `<div class="nurtureItemList></div>"`);

  let items = document.querySelectorAll(".nurtureItemList > p");
  for (var i = 0; i < items.length; i++) {
    items[i].remove();
  }
}

function resetItemPage() {
  document.querySelector("#itemModule").classList.remove("like");
  document.querySelector("#itemModule").classList.remove("dislike");
  document.querySelector("#itemModule").classList.remove("love");
  document.querySelector("#itemModule").classList.remove("hate");
  resetDots();
}
function resetDots() {
  let dots = document.querySelectorAll(".dots");
  for (var i = 0; i < dots.length; i++) {
    while (dots[i].firstChild) {
      dots[i].firstChild.remove();
    }
  }
}

function reattachAddNewListener(){
  document.querySelector(".addNew")
    .addEventListener("click", onAddNewItemClick);
}
const onAddNewItemClick = () => {
  loadPage("addNew")
};

document.addEventListener("keypress", e => {
  if (e.key === "-") {
    nurtureItems = [];
    showIntroModule = true;
    intensity = "likeDislike";
    updateStorage(["all"]);
    updateDataFromStorage();
  }
})

// document.addEventListener("keypress", e => {
//   if (e.key === "=") {
//     alert(nurtureItems[activeItemId].log)
//   }
// })


//first run
runBootstrapProcess();
updateDataFromStorage();
getIntroFromStorage();
formGoalToggle("like");
