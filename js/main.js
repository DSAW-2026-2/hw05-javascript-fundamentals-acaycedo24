import { validateField, validateForm } from "./validation.js";

const offers = [
  { id: 1, product: "Cuaderno argollado 100 hojas", detail: "Cuadriculado · Tamaño carta", category: "cuadernos", icon: "▤", provider: "Distribuciones Andina", city: "Bogotá", price: 12500, minimum: 12, deliveryDays: 2, availability: "available" },
  { id: 2, product: "Resma de papel carta 75 g", detail: "500 hojas · Blanco", category: "papeleria", icon: "▱", provider: "Papeles del Centro", city: "Chía", price: 18400, minimum: 5, deliveryDays: 1, availability: "available" },
  { id: 3, product: "Bolígrafo tinta negra", detail: "Punta fina · Caja x 12", category: "escritura", icon: "╱", provider: "Suministros Nova", city: "Bogotá", price: 950, minimum: 24, deliveryDays: 3, availability: "limited" },
  { id: 4, product: "Carpeta legajadora oficio", detail: "Cartón · Gancho plástico", category: "archivo", icon: "▰", provider: "Archivo & Papel SAS", city: "Cajicá", price: 2800, minimum: 10, deliveryDays: 2, availability: "available" },
  { id: 5, product: "Marcador borrable surtido", detail: "Paquete x 4 colores", category: "escritura", icon: "╲", provider: "Comercializadora Prisma", city: "Bogotá", price: 8900, minimum: 6, deliveryDays: 4, availability: "available" },
  { id: 6, product: "Notas adhesivas 76 x 76 mm", detail: "Bloc x 100 · Amarillo", category: "papeleria", icon: "◆", provider: "Todo Oficina Colombia", city: "Funza", price: 4200, minimum: 8, deliveryDays: 2, availability: "limited" },
  { id: 7, product: "Cuaderno cosido 50 hojas", detail: "Ferrocarril · Tamaño grande", category: "cuadernos", icon: "▥", provider: "Distribuciones Andina", city: "Bogotá", price: 6800, minimum: 12, deliveryDays: 2, availability: "available" },
  { id: 8, product: "Caja de archivo referencia X200", detail: "Cartón kraft · 20 unidades", category: "archivo", icon: "▦", provider: "Archivo & Papel SAS", city: "Cajicá", price: 56000, minimum: 1, deliveryDays: 5, availability: "available" }
];

const elements = {
  offersBody: document.querySelector("#offers-body"),
  search: document.querySelector("#offer-search"),
  category: document.querySelector("#category-filter"),
  availability: document.querySelector("#availability-filter"),
  sort: document.querySelector("#sort-filter"),
  resultSummary: document.querySelector("#result-summary"),
  emptyState: document.querySelector("#empty-state"),
  clearFilters: document.querySelector("#clear-filters"),
  dialog: document.querySelector("#request-dialog"),
  form: document.querySelector("#request-form"),
  product: document.querySelector("#product"),
  deliveryDate: document.querySelector("#delivery-date"),
  notes: document.querySelector("#notes"),
  notesCounter: document.querySelector("#notes-counter"),
  toast: document.querySelector("#success-toast"),
  activityList: document.querySelector("#activity-list"),
  sidebar: document.querySelector("#sidebar"),
  menuToggle: document.querySelector("#menu-toggle")
};

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function getAvailabilityLabel(value) {
  return value === "available" ? "Disponible" : "Cupo limitado";
}

function createOfferRow(offer) {
  return `
    <tr>
      <td>
        <div class="product-cell">
          <span class="product-thumb" aria-hidden="true">${offer.icon}</span>
          <span><strong>${offer.product}</strong><small>${offer.detail}</small></span>
        </div>
      </td>
      <td><span class="provider-cell"><strong>${offer.provider}</strong><small>${offer.city}</small></span></td>
      <td><span class="price-cell"><strong>${formatCurrency(offer.price)}</strong><small>por unidad</small></span></td>
      <td>${offer.minimum} ${offer.minimum === 1 ? "unidad" : "unidades"}</td>
      <td><span class="delivery-cell"><strong>${offer.deliveryDays} ${offer.deliveryDays === 1 ? "día" : "días"}</strong><small>Estimado</small></span></td>
      <td><span class="status-badge ${offer.availability}">${getAvailabilityLabel(offer.availability)}</span></td>
      <td><button class="row-action" type="button" data-offer-id="${offer.id}">Solicitar</button></td>
    </tr>
  `;
}

function renderOffers(list) {
  elements.offersBody.innerHTML = list.map(createOfferRow).join("");
  elements.resultSummary.textContent = `${list.length} ${list.length === 1 ? "oferta encontrada" : "ofertas encontradas"}`;
  elements.emptyState.hidden = list.length !== 0;
  elements.offersBody.closest(".table-scroll").hidden = list.length === 0;
}

function getFilteredOffers() {
  const term = normalizeText(elements.search.value);
  const category = elements.category.value;
  const availability = elements.availability.value;

  const filtered = offers.filter((offer) => {
    const searchableText = normalizeText(`${offer.product} ${offer.detail} ${offer.provider} ${offer.city} ${offer.category}`);
    const matchesTerm = !term || searchableText.includes(term);
    const matchesCategory = category === "all" || offer.category === category;
    const matchesAvailability = availability === "all" || offer.availability === availability;
    return matchesTerm && matchesCategory && matchesAvailability;
  });

  return filtered.sort((first, second) => {
    if (elements.sort.value === "price-asc") {
      return first.price - second.price;
    }
    if (elements.sort.value === "price-desc") {
      return second.price - first.price;
    }
    if (elements.sort.value === "delivery") {
      return first.deliveryDays - second.deliveryDays;
    }
    return first.id - second.id;
  });
}

function applyFilters() {
  renderOffers(getFilteredOffers());
}

function populateProductOptions() {
  const options = offers.map((offer) => (
    `<option value="${offer.id}">${offer.product} · ${offer.provider}</option>`
  ));
  elements.product.insertAdjacentHTML("beforeend", options.join(""));
}

function setMinimumDeliveryDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  elements.deliveryDate.min = tomorrow.toISOString().split("T")[0];
}

function showFieldError(field, message) {
  const errorElement = document.querySelector(`#${field.id}-error`);
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateAndShowField(field) {
  const message = validateField(field);
  showFieldError(field, message);
  return !message;
}

function clearFormErrors() {
  elements.form.querySelectorAll("[name]").forEach((field) => showFieldError(field, ""));
}

function openRequestDialog(offerId = "") {
  elements.product.value = String(offerId);
  clearFormErrors();
  elements.dialog.showModal();
  window.setTimeout(() => {
    if (offerId) {
      document.querySelector("#quantity").focus();
    } else {
      elements.product.focus();
    }
  }, 0);
}

function closeRequestDialog() {
  elements.dialog.close();
  elements.form.reset();
  elements.notesCounter.textContent = "0/180";
  clearFormErrors();
}

function addRequestToActivity(productName) {
  const activity = document.createElement("li");
  activity.className = "highlight";
  activity.innerHTML = `
    <span class="activity-dot green" aria-hidden="true"></span>
    <div><strong>Solicitud ficticia guardada</strong><p>${productName}</p></div>
    <time datetime="${new Date().toISOString()}">Ahora</time>
  `;
  elements.activityList.prepend(activity);
}

let toastTimer;

function showToast() {
  window.clearTimeout(toastTimer);
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 5000);
}

function handleFormSubmit(event) {
  event.preventDefault();
  const errors = validateForm(elements.form);

  elements.form.querySelectorAll("[name]").forEach((field) => {
    showFieldError(field, errors[field.name] || "");
  });

  const firstInvalidField = elements.form.querySelector(".invalid");
  if (firstInvalidField) {
    firstInvalidField.focus();
    return;
  }

  const selectedOption = elements.product.options[elements.product.selectedIndex];
  addRequestToActivity(selectedOption.textContent);
  closeRequestDialog();
  showToast();
}

function clearFilters() {
  elements.search.value = "";
  elements.category.value = "all";
  elements.availability.value = "all";
  elements.sort.value = "recommended";
  applyFilters();
  elements.search.focus();
}

function toggleMobileMenu() {
  const isOpen = elements.sidebar.classList.toggle("open");
  elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
}

elements.search.addEventListener("input", applyFilters);
elements.category.addEventListener("change", applyFilters);
elements.availability.addEventListener("change", applyFilters);
elements.sort.addEventListener("change", applyFilters);
elements.clearFilters.addEventListener("click", clearFilters);

elements.offersBody.addEventListener("click", (event) => {
  const requestButton = event.target.closest("[data-offer-id]");
  if (requestButton) {
    openRequestDialog(requestButton.dataset.offerId);
  }
});

document.querySelector("#new-request-button").addEventListener("click", () => openRequestDialog());
document.querySelector("#close-dialog").addEventListener("click", closeRequestDialog);
document.querySelector("#cancel-dialog").addEventListener("click", closeRequestDialog);
document.querySelector("#close-toast").addEventListener("click", () => {
  elements.toast.hidden = true;
});
document.querySelector("#dismiss-notice").addEventListener("click", (event) => {
  event.currentTarget.closest(".data-notice").hidden = true;
});

elements.form.addEventListener("submit", handleFormSubmit);
elements.form.querySelectorAll("[name]").forEach((field) => {
  field.addEventListener("blur", () => validateAndShowField(field));
  field.addEventListener(field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input", () => {
    if (field.classList.contains("invalid")) {
      validateAndShowField(field);
    }
  });
});

elements.notes.addEventListener("input", () => {
  elements.notesCounter.textContent = `${elements.notes.value.length}/180`;
});

elements.menuToggle.addEventListener("click", toggleMobileMenu);
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 820 && elements.sidebar.classList.contains("open") && !elements.sidebar.contains(event.target) && !elements.menuToggle.contains(event.target)) {
    toggleMobileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
    elements.search.select();
  }

  if (event.key === "Escape") {
    if (elements.dialog.open) {
      event.preventDefault();
      closeRequestDialog();
    } else if (elements.sidebar.classList.contains("open")) {
      toggleMobileMenu();
    }
  }
});

populateProductOptions();
setMinimumDeliveryDate();
renderOffers(offers);
