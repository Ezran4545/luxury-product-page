const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const buyButton = document.querySelector(".buy-btn");
const quantitySelect = document.getElementById("quantity");
const mobileQuantity = document.getElementById("mobileQuantity");
const mobileBuyButton = document.querySelector(".mobile-buy-btn");
const wishlistBtn = document.getElementById("wishlistBtn");
const cartNote = document.querySelector(".cart-note");
const sizeChips = document.querySelectorAll("#sizeChips .chip");
const colorChips = document.querySelectorAll("#colorChips .chip");
const reviewFilters = document.querySelectorAll(".review-filter");
const reviewCards = document.querySelectorAll(".review-card");
const miniCartCount = document.getElementById("miniCartCount");
const miniCartTotal = document.getElementById("miniCartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const unitPrice = 1299;
let cartItems = 0;
let cartSubtotal = 0;

// GALLERY
const thumbnails = document.querySelectorAll(".gallery img");
const mainImage = document.getElementById("mainImage");

// SCROLL BUTTONS
const gallery = document.querySelector(".gallery");

document.querySelector(".left").onclick = () => {
  gallery.scrollBy({ left: -110, behavior: "smooth" });
};

document.querySelector(".right").onclick = () => {
  gallery.scrollBy({ left: 110, behavior: "smooth" });
};

// LIGHTBOX
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragMoved = false;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let activeImageIndex = 0;

function applyImageTransform() {
  lightboxImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

function resetPan() {
  panX = 0;
  panY = 0;
}

function clampPan() {
  if (zoomLevel <= 1) {
    resetPan();
    return;
  }

  const rect = lightboxImg.getBoundingClientRect();
  const limitX = (rect.width * (zoomLevel - 1)) / 2;
  const limitY = (rect.height * (zoomLevel - 1)) / 2;
  panX = Math.max(-limitX, Math.min(limitX, panX));
  panY = Math.max(-limitY, Math.min(limitY, panY));
}

function setZoom(level) {
  zoomLevel = Math.min(3, Math.max(1, level));
  clampPan();
  applyImageTransform();
  lightboxImg.style.cursor = zoomLevel > 1 ? "grab" : "zoom-in";
  zoomResetBtn.textContent = `${Math.round(zoomLevel * 100)}%`;
}

function openLightbox(src) {
  lightbox.style.display = "flex";
  lightboxImg.src = src;
  resetPan();
  setZoom(1);
}

function closeLightbox() {
  lightbox.style.display = "none";
  resetPan();
  setZoom(1);
}

thumbnails.forEach((img) => {
  img.onclick = () => {
    thumbnails.forEach((i) => i.classList.remove("active"));
    img.classList.add("active");
    activeImageIndex = Array.from(thumbnails).indexOf(img);
    openLightbox(img.src);
  };
});

mainImage.onclick = () => openLightbox(mainImage.src);

function showRelativeImage(step) {
  activeImageIndex = (activeImageIndex + step + thumbnails.length) % thumbnails.length;
  const targetImage = thumbnails[activeImageIndex];
  thumbnails.forEach((thumb) => thumb.classList.remove("active"));
  targetImage.classList.add("active");
  openLightbox(targetImage.src);
}

lightbox.onclick = (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
};

lightboxClose.onclick = closeLightbox;
zoomInBtn.onclick = () => setZoom(zoomLevel + 0.2);
zoomOutBtn.onclick = () => setZoom(zoomLevel - 0.2);
zoomResetBtn.onclick = () => setZoom(1);
lightboxImg.onclick = () => {
  if (!dragMoved) {
    setZoom(zoomLevel >= 2.8 ? 1 : zoomLevel + 0.3);
  }
  dragMoved = false;
};
lightboxImg.onwheel = (event) => {
  event.preventDefault();
  setZoom(zoomLevel + (event.deltaY < 0 ? 0.15 : -0.15));
};
lightboxImg.onmousedown = (event) => {
  if (zoomLevel <= 1) {
    return;
  }
  isDragging = true;
  dragMoved = false;
  dragStartX = event.clientX - panX;
  dragStartY = event.clientY - panY;
  lightboxImg.style.cursor = "grabbing";
};

window.addEventListener("mousemove", (event) => {
  if (!isDragging) {
    return;
  }

  const nextPanX = event.clientX - dragStartX;
  const nextPanY = event.clientY - dragStartY;
  if (Math.abs(nextPanX - panX) > 1 || Math.abs(nextPanY - panY) > 1) {
    dragMoved = true;
  }
  panX = nextPanX;
  panY = nextPanY;
  clampPan();
  applyImageTransform();
});

window.addEventListener("mouseup", () => {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  lightboxImg.style.cursor = zoomLevel > 1 ? "grab" : "zoom-in";
});

lightboxImg.ontouchstart = (event) => {
  if (event.touches.length === 2) {
    isDragging = false;
    const [touchA, touchB] = event.touches;
    pinchStartDistance = Math.hypot(
      touchA.clientX - touchB.clientX,
      touchA.clientY - touchB.clientY
    );
    pinchStartZoom = zoomLevel;
    return;
  }

  if (zoomLevel <= 1 || event.touches.length !== 1) {
    return;
  }
  const touch = event.touches[0];
  isDragging = true;
  dragMoved = false;
  dragStartX = touch.clientX - panX;
  dragStartY = touch.clientY - panY;
};

lightboxImg.ontouchmove = (event) => {
  if (event.touches.length === 2) {
    event.preventDefault();
    const [touchA, touchB] = event.touches;
    const currentDistance = Math.hypot(
      touchA.clientX - touchB.clientX,
      touchA.clientY - touchB.clientY
    );
    if (pinchStartDistance > 0) {
      const pinchRatio = currentDistance / pinchStartDistance;
      setZoom(pinchStartZoom * pinchRatio);
    }
    return;
  }

  if (!isDragging || event.touches.length !== 1) {
    return;
  }
  event.preventDefault();
  const touch = event.touches[0];
  const nextPanX = touch.clientX - dragStartX;
  const nextPanY = touch.clientY - dragStartY;
  if (Math.abs(nextPanX - panX) > 1 || Math.abs(nextPanY - panY) > 1) {
    dragMoved = true;
  }
  panX = nextPanX;
  panY = nextPanY;
  clampPan();
  applyImageTransform();
};

lightboxImg.ontouchend = () => {
  isDragging = false;
  pinchStartDistance = 0;
};

// THEME TOGGLE
themeToggle.onclick = () => {
  const isDark = body.dataset.theme === "dark";
  body.dataset.theme = isDark ? "light" : "dark";
  themeToggle.textContent = isDark ? "Dark Mode" : "Light Mode";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to dark mode" : "Switch to light mode");
};

function activateChip(chips, selectedChip) {
  chips.forEach((chip) => chip.classList.remove("active"));
  selectedChip.classList.add("active");
}

sizeChips.forEach((chip) => {
  chip.onclick = () => activateChip(sizeChips, chip);
});

colorChips.forEach((chip) => {
  chip.onclick = () => activateChip(colorChips, chip);
});

if (wishlistBtn) {
  wishlistBtn.onclick = () => {
    const isActive = wishlistBtn.classList.toggle("active");
    wishlistBtn.textContent = isActive ? "♥ Wishlisted" : "♡ Wishlist";
  };
}

if (reviewFilters.length) {
  reviewFilters.forEach((filterBtn) => {
    filterBtn.onclick = () => {
      reviewFilters.forEach((btn) => btn.classList.remove("active"));
      filterBtn.classList.add("active");
      const selectedRating = filterBtn.dataset.rating;

      reviewCards.forEach((card) => {
        const cardRating = Number(card.dataset.rating);
        const shouldShow = selectedRating === "all"
          ? true
          : selectedRating === "3"
            ? cardRating <= 3
            : cardRating === Number(selectedRating);
        card.classList.toggle("hidden", !shouldShow);
      });
    };
  });
}

function updateMiniCart() {
  miniCartCount.textContent = String(cartItems);
  miniCartTotal.textContent = `$${cartSubtotal.toLocaleString()}`;
}

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    cartNote.textContent = cartItems > 0
      ? `Proceeding to checkout with ${cartItems} item(s)`
      : "Your cart is empty. Add an item to continue";
  };
}

// ADD TO CART FEEDBACK
function handleAddToCart(quantityValue, triggerButton) {
  const quantity = Number(quantityValue);
  const selectedSize = document.querySelector("#sizeChips .chip.active")?.dataset.value || "40mm";
  const selectedColor = document.querySelector("#colorChips .chip.active")?.dataset.value || "Gold";
  cartItems += quantity;
  cartSubtotal += unitPrice * quantity;
  updateMiniCart();
  cartNote.textContent = `${quantityValue} item(s) added: ${selectedSize}, ${selectedColor}`;
  buyButton.classList.add("success");
  buyButton.textContent = "Added";
  if (mobileBuyButton) {
    mobileBuyButton.textContent = "Added";
  }
  if (triggerButton) {
    triggerButton.classList.add("success");
  }

  setTimeout(() => {
    buyButton.classList.remove("success");
    buyButton.textContent = "Add to Cart";
    if (mobileBuyButton) {
      mobileBuyButton.textContent = "Add to Cart";
      mobileBuyButton.classList.remove("success");
    }
    if (triggerButton) {
      triggerButton.classList.remove("success");
    }
  }, 1200);
}

updateMiniCart();

buyButton.onclick = () => {
  if (mobileQuantity && window.innerWidth <= 768) {
    quantitySelect.value = mobileQuantity.value;
  }
  handleAddToCart(quantitySelect.value, buyButton);
};

if (mobileBuyButton && mobileQuantity) {
  mobileBuyButton.onclick = () => {
    quantitySelect.value = mobileQuantity.value;
    handleAddToCart(mobileQuantity.value, mobileBuyButton);
  };

  quantitySelect.onchange = () => {
    mobileQuantity.value = quantitySelect.value;
  };

  mobileQuantity.onchange = () => {
    quantitySelect.value = mobileQuantity.value;
  };
}

// Keyboard support for lightbox
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
  if (lightbox.style.display === "flex" && event.key === "ArrowRight") {
    showRelativeImage(1);
  }
  if (lightbox.style.display === "flex" && event.key === "ArrowLeft") {
    showRelativeImage(-1);
  }
});