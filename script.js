// Food menu data

const foods = [
    {
        id: 1,
        name: "Chicken Biryani",
        category: "Meals",
        price: 180,
        emoji: "🍛",
        description: "Aromatic biryani with delicious spices."
    },
    {
        id: 2,
        name: "Veg Meals",
        category: "Meals",
        price: 120,
        emoji: "🍱",
        description: "Complete vegetarian meal."
    },
    {
        id: 3,
        name: "Masala Dosa",
        category: "Meals",
        price: 80,
        emoji: "🥞",
        description: "Crispy dosa with potato masala."
    },
    {
        id: 4,
        name: "Burger",
        category: "Snacks",
        price: 120,
        emoji: "🍔",
        description: "Burger with fresh vegetables."
    },
    {
        id: 5,
        name: "Pizza",
        category: "Snacks",
        price: 250,
        emoji: "🍕",
        description: "Cheesy pizza with a crispy crust."
    },
    {
        id: 6,
        name: "French Fries",
        category: "Snacks",
        price: 90,
        emoji: "🍟",
        description: "Crispy golden potato fries."
    },
    {
        id: 7,
        name: "Cold Coffee",
        category: "Drinks",
        price: 100,
        emoji: "🥤",
        description: "Refreshing chilled coffee."
    },
    {
        id: 8,
        name: "Fresh Juice",
        category: "Drinks",
        price: 70,
        emoji: "🧃",
        description: "Fresh fruit juice."
    },
    {
        id: 9,
        name: "Ice Cream",
        category: "Snacks",
        price: 80,
        emoji: "🍨",
        description: "Creamy vanilla ice cream."
    },
    {
        id: 10,
        name: "Lemon Juice",
        category: "Drinks",
        price: 40,
        emoji: "🍋",
        description: "Fresh and refreshing lemon juice."
    }
];

const STORAGE_KEY = "foodieCart";

let activeCategory = "All";
let cart = loadCart();

const foodList = document.getElementById("food-list");
const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const message = document.getElementById("message");
const placeOrderButton = document.getElementById("place-order");
const orderSummary = document.getElementById("order-summary");


// Load saved cart

function loadCart() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(item =>
                foods.some(food => food.id === item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity >= 1 &&
                item.quantity <= 99
            )
            .map(item => ({
                ...foods.find(food => food.id === item.id),
                quantity: item.quantity
            }));
    } catch {
        return [];
    }
}


// Save cart

function saveCart() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            )
        );
    } catch (error) {
        console.error("Could not save cart:", error);
    }
}


// Display food menu

function displayFoods() {
    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const filteredFoods = foods.filter(food => {
        const categoryMatch =
            activeCategory === "All" ||
            food.category === activeCategory;

        const searchMatch =
            food.name.toLowerCase().includes(searchText) ||
            food.description.toLowerCase().includes(searchText);

        return categoryMatch && searchMatch;
    });

    foodList.innerHTML = filteredFoods.map(food => `
        <article class="food-card">

            <div class="food-image" role="img"
                 aria-label="${food.name}">
                ${food.emoji}
            </div>

            <div class="food-info">

                <h3>${food.name}</h3>

                <p>${food.description}</p>

                <p>Category: ${food.category}</p>

                <p class="price">
                    ₹${food.price.toFixed(2)}
                </p>

                <button
                    class="add-btn"
                    type="button"
                    data-add="${food.id}">
                    Add to Cart
                </button>

            </div>

        </article>
    `).join("");

    document.getElementById("no-results").hidden =
        filteredFoods.length !== 0;
}


// Category buttons

document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        document.querySelectorAll(".category-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        displayFoods();
    });
});


// Search

searchInput.addEventListener("input", displayFoods);


// Add food to cart

foodList.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (!button) return;

    const id = Number(button.dataset.add);
    const food = foods.find(item => item.id === id);

    if (!food) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        if (existingItem.quantity >= 99) {
            message.textContent = "Maximum quantity is 99.";
            return;
        }

        existingItem.quantity++;
    } else {
        cart.push({
            ...food,
            quantity: 1
        });
    }

    message.textContent = "";
    orderSummary.hidden = true;

    saveCart();
    displayCart();
});


// Change item quantity

function changeQuantity(id, amount) {
    const item = cart.find(food => food.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(food => food.id !== id);
    }

    if (item.quantity > 99) {
        item.quantity = 99;
    }

    message.textContent = "";
    orderSummary.hidden = true;

    saveCart();
    displayCart();
}


// Display cart

function displayCart() {
    if (cart.length === 0) {
        cartItems.innerHTML =
            "<p>Your cart is empty. Add food items!</p>";
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-row">

                <div>
                    <strong>${item.emoji} ${item.name}</strong>
                    <p>₹${item.price.toFixed(2)} each</p>
                </div>

                <div class="quantity-controls">

                    <button type="button"
                        data-change="-1"
                        data-id="${item.id}"
                        aria-label="Decrease ${item.name}">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button type="button"
                        data-change="1"
                        data-id="${item.id}"
                        aria-label="Increase ${item.name}">
                        +
                    </button>

                </div>

                <strong>
                    ₹${(
                        item.price * item.quantity
                    ).toFixed(2)}
                </strong>

            </div>
        `).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    totalElement.textContent = total.toFixed(2);

    cartCount.textContent = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    placeOrderButton.disabled = cart.length === 0;
}


// Cart quantity buttons

cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-change]");

    if (!button) return;

    changeQuantity(
        Number(button.dataset.id),
        Number(button.dataset.change)
    );
});


// Clear cart

document.getElementById("clear-cart")
    .addEventListener("click", () => {
        cart = [];

        saveCart();
        displayCart();

        message.textContent = "Cart cleared successfully.";
        orderSummary.hidden = true;
    });


// Safe text display for customer information

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// Place order

document.getElementById("checkout-form")
    .addEventListener("submit", event => {
        event.preventDefault();

        if (cart.length === 0) {
            message.textContent =
                "Please add food items before placing an order.";
            return;
        }

        if (!event.currentTarget.reportValidity()) {
            return;
        }

        const name = document
            .getElementById("customer-name")
            .value.trim();

        const phone = document
            .getElementById("customer-phone")
            .value.trim();

        const address = document
            .getElementById("customer-address")
            .value.trim();

        if (!name || !phone || !address) {
            message.textContent =
                "Please fill in all delivery details.";
            return;
        }

        const orderId =
            "FD" + Date.now().toString().slice(-8);

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const summary = cart.map(item =>
            `${item.name} × ${item.quantity} ` +
            `(₹${(item.price * item.quantity).toFixed(2)})`
        ).join(", ");

        orderSummary.innerHTML = `
            <h3>✅ Order Placed Successfully!</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Name:</strong> ${escapeHTML(name)}</p>
            <p><strong>Phone:</strong> ${escapeHTML(phone)}</p>
            <p><strong>Address:</strong> ${escapeHTML(address)}</p>
            <p><strong>Items:</strong> ${escapeHTML(summary)}</p>
            <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
            <p>This is a demo order. No real payment was processed.</p>
        `;

        orderSummary.hidden = false;

        cart = [];

        saveCart();
        displayCart();

        message.textContent = "Thank you for your order!";

        event.currentTarget.reset();

        orderSummary.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });


// Initialize the website when the page opens

displayFoods();
displayCart();
