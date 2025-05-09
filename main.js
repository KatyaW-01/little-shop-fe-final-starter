import './style.css'
import {fetchData, postData, deleteData, editData} from './apiCalls'
import {showStatus} from './errorHandling'

//Sections, buttons, text
const couponsView = document.querySelector("#coupons-view")
const itemsView = document.querySelector("#items-view")
const merchantsView = document.querySelector("#merchants-view")
const merchantsNavButton = document.querySelector("#merchants-nav")
const itemsNavButton = document.querySelector("#items-nav")
const addNewButton = document.querySelector("#add-new-button")
const showingText = document.querySelector("#showing-text")
const activeCoupons = document.querySelector("#view-active-button")
const backButton = document.querySelector("#back-button")

//Form elements
const merchantForm = document.querySelector("#new-merchant-form")
const newMerchantName = document.querySelector("#new-merchant-name")
const submitMerchantButton = document.querySelector("#submit-merchant")

// Event Listeners
merchantsView.addEventListener('click', (event) => {
  handleMerchantClicks(event)
})

merchantsNavButton.addEventListener('click', showMerchantsView)
itemsNavButton.addEventListener('click', showItemsView)

addNewButton.addEventListener('click', () => {
  hide([addNewButton])
  show([merchantForm])
})

submitMerchantButton.addEventListener('click', (event) => {
  submitMerchant(event)
})

activeCoupons.addEventListener('click', (event)=> {
  handleMerchantClicks(event)
})

backButton.addEventListener('click',(event)=>{ 
  handleMerchantClicks(event)
})

//Global variables
let merchants;
let items;
let coupons; 
let allActiveCoupons;

//Page load data fetching
Promise.all([fetchData('merchants'), fetchData('items'), fetchData('coupons')])
.then(responses => {
    merchants = responses[0].data
    items = responses[1].data
    displayMerchants(merchants)
    hide([activeCoupons,backButton])
  })
  .catch(err => {
    console.log('catch error: ', err)
  })

// Merchant CRUD Functions
function handleMerchantClicks(event) {
  if (event.target.classList.contains("delete-merchant")) {
    deleteMerchant(event)
  } else if (event.target.classList.contains("edit-merchant")) {
    editMerchant(event)
  } else if (event.target.classList.contains("view-merchant-coupons")) {
    getMerchantCoupons(event)
  } else if (event.target.classList.contains("view-merchant-items")) {
    displayMerchantItems(event)
  } else if (event.target.classList.contains("submit-merchant-edits")) {
    submitMerchantEdits(event)
  } else if (event.target.classList.contains("discard-merchant-edits")) {
    discardMerchantEdits(event)
  } else if (event.target.classList.contains("view-active-coupons")){
    getActiveMerchantCoupons(event)
  } else if (event.target.classList.contains("back-to-coupons")){
    backToAllMerchantCoupons(event) 
  }
}

function deleteMerchant(event) {
  const id = event.target.closest("article").id.split('-')[1]
  deleteData(`merchants/${id}`)
    .then(() => {
      let deletedMerchant = findMerchant(id)
      let indexOfMerchant = merchants.indexOf(deletedMerchant)
      merchants.splice(indexOfMerchant, 1)
      displayMerchants(merchants)
      showStatus('Success! Merchant removed!', true)
    })
}

function editMerchant(event) {
  const article = event.target.closest("article")
  const h3Name = article.firstElementChild
  const editInput = article.querySelector(".edit-merchant-input")
  const submitEditsButton = article.querySelector(".submit-merchant-edits")
  const discardEditsButton = article.querySelector(".discard-merchant-edits")
  const viewCouponButton = article.querySelector(".view-merchant-coupons")
  const viewItemsButton = article.querySelector(".view-merchant-items")
  const editMerchantButton = article.querySelector(".edit-merchant")
  const deleteMerchantButton = article.querySelector(".delete-merchant")
  editInput.value = h3Name.innerText
  show([editInput, submitEditsButton, discardEditsButton])
  hide([viewCouponButton, viewItemsButton, editMerchantButton, deleteMerchantButton])
}

function submitMerchantEdits(event) {
  event.preventDefault();
  const article = event.target.closest("article")
  const editInput = article.querySelector(".edit-merchant-input")
  const id = article.id.split('-')[1]

  const patchBody = { name: editInput.value }
  editData(`merchants/${id}`, patchBody)
    .then(patchResponse => {
      let merchantToUpdate = findMerchant(patchResponse.data.id)
      let indexOfMerchant = merchants.indexOf(merchantToUpdate)
      merchants.splice(indexOfMerchant, 1, patchResponse.data)
      displayMerchants(merchants)
      showStatus('Success! Merchant updated!', true)
    })
}

function discardMerchantEdits(event) {
  const article = event.target.closest("article")
  const editInput = article.querySelector(".edit-merchant-input")
  const submitEditsButton = article.querySelector(".submit-merchant-edits")
  const discardEditsButton = article.querySelector(".discard-merchant-edits")
  const viewCouponButton = article.querySelector(".view-merchant-coupons")
  const viewItemsButton = article.querySelector(".view-merchant-items")
  const editMerchantButton = article.querySelector(".edit-merchant")
  const deleteMerchantButton = article.querySelector(".delete-merchant")

  editInput.value = ""
  hide([editInput, submitEditsButton, discardEditsButton])
  show([viewCouponButton, viewItemsButton, editMerchantButton, deleteMerchantButton])
}

function submitMerchant(event) {
  event.preventDefault()
  var merchantName = newMerchantName.value
  postData('merchants', { name: merchantName })
    .then(postedMerchant => {
      merchants.push(postedMerchant.data)
      displayAddedMerchant(postedMerchant.data)
      newMerchantName.value = ''
      showStatus('Success! Merchant added!', true)
      hide([merchantForm]) 
    })
}

// Functions that control the view 
function showMerchantsView() {
  showingText.innerText = "All Merchants"
  addRemoveActiveNav(merchantsNavButton, itemsNavButton)
  addNewButton.dataset.state = 'merchant'
  show([merchantsView, addNewButton])
  hide([itemsView, backButton,activeCoupons])
  displayMerchants(merchants)
}

function showItemsView() {
  showingText.innerText = "All Items"
  addRemoveActiveNav(itemsNavButton, merchantsNavButton)
  addNewButton.dataset.state = 'item'
  show([itemsView])
  hide([merchantsView, merchantForm, addNewButton, couponsView])
  displayItems(items)
}

function showMerchantItemsView(id, items) {
  showingText.innerText = `All Items for Merchant #${id}`
  show([itemsView])
  hide([merchantsView, addNewButton, couponsView])
  addRemoveActiveNav(itemsNavButton, merchantsNavButton)
  addNewButton.dataset.state = 'item'
  displayItems(items)
}

// Functions that add data to the DOM
function displayItems(items) {
  itemsView.innerHTML = ''
  let firstHundredItems = items.slice(0, 99)
  firstHundredItems.forEach(item => {
    let merchant = findMerchant(item.attributes.merchant_id).attributes.name
    itemsView.innerHTML += `
     <article class="item" id="item-${item.id}">
          <img src="" alt="">
          <h2>${item.attributes.name}</h2>
          <p>${item.attributes.description}</p>
          <p>$${item.attributes.unit_price}</p>
          <p class="merchant-name-in-item">Merchant: ${merchant}</p>
        </article>`
  })
}

function displayMerchants(merchants) {
    merchantsView.innerHTML = ''
    merchants.forEach(merchant => {
        merchantsView.innerHTML += 
        `<article class="merchant" id="merchant-${merchant.id}">
          <h3 class="merchant-name">${merchant.attributes.name}</h3>
          <div class="merchant-options">
            <button class="view-merchant-coupons">View Coupons</button>
            <button class="view-merchant-items">View Items</button>
            <button class="edit-merchant">Edit</button>
            <input class="edit-merchant-input hidden" name="edit-merchant" type="text">
            <button class="submit-merchant-edits hidden">
              Submit Edits
            </button>
            <button class="discard-merchant-edits hidden">
              Discard Edits
            </button>
            <button class="delete-merchant">Delete</button>
          </div>
        </article>` 
    })
}

function displayAddedMerchant(merchant) {
      merchantsView.insertAdjacentHTML('beforeend', 
      `<article class="merchant" id="merchant-${merchant.id}">
          <h3 class="merchant-name">${merchant.attributes.name}</h3>
          <div class="merchant-options">
            <button class="view-merchant-coupons">View Coupons</button>
            <button class="view-merchant-items">View Items</button>
            <button class="edit-merchant">Edit</button>
            <input class="edit-merchant-input hidden" name="edit-merchant" type="text">
            <button class="submit-merchant-edits hidden">
              Submit Edits
            </button>
            <button class="discard-merchant-edits hidden">
              Discard Edits
            </button>
            <button class="delete-merchant">Delete</button>
          </div>
        </article>`)
}

function displayMerchantItems(event) {
  let merchantId = event.target.closest("article").id.split('-')[1]
  const filteredMerchantItems = filterByMerchant(merchantId)
  showMerchantItemsView(merchantId, filteredMerchantItems)
}

function getMerchantCoupons(event){ 
  let merchantId = event.target.closest("article").id.split('-')[1]
  console.log("Merchant ID:", merchantId)
  activeCoupons.dataset.merchantId = merchantId
  backButton.dataset.merchantId = merchantId
  fetchData(`merchants/${merchantId}/coupons`)
  .then(couponData => {
    console.log("Coupon data from fetch:", couponData)
    coupons = couponData.data
    displayMerchantCoupons(coupons,event);
    
  })
}

function backToAllMerchantCoupons(event) { 
  let merchantId = event.target.dataset.merchantId 
  console.log("Merchant ID:", merchantId)
  fetchData(`merchants/${merchantId}/coupons`)
  .then(couponData => {
    console.log("Coupon data from fetch:", couponData)
    coupons = couponData.data
    displayAllMerchantCoupons(coupons,event);
  })
}

function displayAllMerchantCoupons(coupons,event){
  show([couponsView,activeCoupons]) 
  hide([merchantsView, itemsView, addNewButton,backButton])
  let merchantId = event.target.dataset.merchantId
  console.log("Merchant ID:", merchantId)
  showingText.innerText = `All coupons for Merchant #${merchantId}`
  couponsView.innerHTML = ''
  coupons.forEach(coupon => {
    couponsView.innerHTML += 
    `<article class="coupon" id="coupon-${coupon.id}">
    <h2 class="coupon-name">${coupon.attributes.name}</h2>
    <p class="coupon-code">${coupon.attributes.code}<p>
    <p class="coupon-value">Value: ${coupon.attributes.value} ${coupon.attributes.value_type} off<p>
    </article>`
  })
}

function getActiveMerchantCoupons(event){
  let merchantId = event.target.dataset.merchantId 
  console.log("Merchant ID:", merchantId)
  fetchData(`merchants/${merchantId}/coupons?status=active`)
  .then(couponData => {
    console.log("Coupon data from fetch:", couponData)
    allActiveCoupons = couponData.data
    displayActiveMerchantCoupons(allActiveCoupons,event);
  })
}

function displayMerchantCoupons(coupons,event) {
  show([couponsView,activeCoupons]) 
  hide([merchantsView, itemsView, addNewButton])
  let merchantId = event.target.closest("article").id.split('-')[1]
  showingText.innerText = `All coupons for Merchant #${merchantId}`
  couponsView.innerHTML = ''
  coupons.forEach(coupon => {
    couponsView.innerHTML += 
    `<article class="coupon" id="coupon-${coupon.id}">
    <h2 class="coupon-name">${coupon.attributes.name}</h2>
    <p class="coupon-code">${coupon.attributes.code}<p>
    <p class="coupon-value">Value: ${coupon.attributes.value} ${coupon.attributes.value_type} off<p>
    </article>`
  })
}

function displayActiveMerchantCoupons(allActiveCoupons,event){
  show([couponsView,backButton]) 
  hide([merchantsView, itemsView, addNewButton,activeCoupons])
  let merchantId = event.target.dataset.merchantId
  showingText.innerText = `All active coupons for Merchant #${merchantId}`
  couponsView.innerHTML = ''
  allActiveCoupons.forEach(coupon => {
    couponsView.innerHTML += 
    `<article class="coupon" id="coupon-${coupon.id}">
    <h2 class="coupon-name">${coupon.attributes.name}</h2>
    <p class="coupon-code">${coupon.attributes.code}<p>
    <p class="coupon-value">Value: ${coupon.attributes.value} ${coupon.attributes.value_type} off<p>
    </article>`
  })
}

//Helper Functions
function show(elements) {
  elements.forEach(element => {
    element.classList.remove('hidden')
  })
}

function hide(elements) {
  elements.forEach(element => {
    element.classList.add('hidden')
  })
}
function addRemoveActiveNav(nav1, nav2) {
  nav1.classList.add('active-nav')
  nav2.classList.remove('active-nav')
}

function filterByMerchant(merchantId) {
  const specificMerchantItems = []

  for (let i = 0; i < items.length; i++) {
    if (items[i].attributes.merchant_id === parseInt(merchantId)) {
      specificMerchantItems.push(items[i])
    }
  }

  return specificMerchantItems
}

function findMerchant(id) {
  let foundMerchant;

  for (let i = 0; i < merchants.length; i++) {
    if (parseInt(merchants[i].id) === parseInt(id)) {
      foundMerchant = merchants[i]
      return foundMerchant
    }
  }
}
