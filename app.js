const cars = [
    { name: "Toyota Yaris", type: "Economy", seats: 5, transmission: "Manual", price: 32, image: "photo-1492144534655-ae79c964c9d7" },
    { name: "Volkswagen Golf", type: "Compact", seats: 5, transmission: "Manual", price: 42, image: "photo-1503376780353-7e6692767b70" },
    { name: "Peugeot 208", type: "Economy", seats: 5, transmission: "Automatic", price: 36, image: "photo-1549317661-bd32c8ce0db2" },
    { name: "BMW 3 Series", type: "Premium", seats: 5, transmission: "Automatic", price: 74, image: "photo-1552519507-da3b142c6e3d" },
    { name: "Jeep Compass", type: "SUV", seats: 5, transmission: "Automatic", price: 68, image: "photo-1519641471654-76ce0107ad1b" },
    { name: "Fiat 500", type: "Mini", seats: 4, transmission: "Manual", price: 29, image: "photo-1502877338535-766e1452684a" },
    { name: "Mercedes-Benz A-Class", type: "Premium", seats: 5, transmission: "Automatic", price: 79, image: "photo-1618843479313-40f8afb4b4d8" },
    { name: "Nissan Qashqai", type: "SUV", seats: 5, transmission: "Automatic", price: 62, image: "photo-1511919884226-fd3cad34687c" },
    { name: "Audi A3", type: "Premium", seats: 5, transmission: "Automatic", price: 72, image: "photo-1494976388531-d1058494cdd8" },
    { name: "Renault Clio", type: "Economy", seats: 5, transmission: "Manual", price: 34, image: "photo-1549317661-bd32c8ce0db2" },
    { name: "Hyundai Tucson", type: "SUV", seats: 5, transmission: "Automatic", price: 64, image: "photo-1503736334956-4c8f8e92946d" },
    { name: "Skoda Octavia", type: "Comfort", seats: 5, transmission: "Manual", price: 49, image: "photo-1489824904134-891ab64532f1" },
    { name: "Ford Mustang", type: "Convertible", seats: 4, transmission: "Automatic", price: 110, image: "photo-1583121274602-3e2820c69888" },
    { name: "Kia Sportage", type: "SUV", seats: 5, transmission: "Automatic", price: 61, image: "photo-1504215680853-026ed2a45def" },
    { name: "Toyota Corolla", type: "Comfort", seats: 5, transmission: "Automatic", price: 46, image: "photo-1541899481282-d53bffe3c35d" },
    { name: "Volvo XC40", type: "Premium SUV", seats: 5, transmission: "Automatic", price: 86, image: "photo-1542362567-b07e54358753" },
    { name: "Opel Corsa", type: "Economy", seats: 5, transmission: "Manual", price: 33, image: "photo-1551830820-330a71b99659" },
    { name: "Mazda CX-5", type: "SUV", seats: 5, transmission: "Automatic", price: 67, image: "photo-1590362891991-f776e747a588" },
    { name: "Audi Q5", type: "Premium SUV", seats: 5, transmission: "Automatic", price: 98, image: "photo-1617814076367-b759c7d7e738" },
    { name: "Mini Cooper", type: "Mini", seats: 4, transmission: "Automatic", price: 52, image: "photo-1605559424843-9e4c228bf1c2" },
    { name: "Dacia Duster", type: "SUV", seats: 5, transmission: "Manual", price: 48, image: "photo-1606152421802-db97b9c7a11b" },
    { name: "Tesla Model 3", type: "Electric", seats: 5, transmission: "Automatic", price: 89, image: "photo-1502161254066-6c74afbf07aa" },
    { name: "Volkswagen Tiguan", type: "SUV", seats: 5, transmission: "Automatic", price: 70, image: "photo-1493238792000-8113da705763" },
    { name: "Peugeot 3008", type: "Comfort SUV", seats: 5, transmission: "Automatic", price: 65, image: "photo-1503376780353-7e6692767b70" },
    { name: "BMW 5 Series", type: "Premium", seats: 5, transmission: "Automatic", price: 105, image: "photo-1552519507-da3b142c6e3d" },
    { name: "Citroën C3", type: "Economy", seats: 5, transmission: "Manual", price: 31, image: "photo-1549317661-bd32c8ce0db2" },
    { name: "Range Rover Evoque", type: "Premium SUV", seats: 5, transmission: "Automatic", price: 119, image: "photo-1519641471654-76ce0107ad1b" },
    { name: "Fiat Panda", type: "Mini", seats: 4, transmission: "Manual", price: 27, image: "photo-1502877338535-766e1452684a" }
];

const carGrid = document.querySelector("#car-grid");
const showMoreButton = document.querySelector("#show-more");
const fleetCount = document.querySelector("#fleet-count");
const visibleCarCount = 8;

function createCarCard(car, index) {
    const card = document.createElement("article");
    card.className = "car-card";
    if (index >= visibleCarCount) {
        card.hidden = true;
        card.classList.add("extra-car");
    }

    const image = document.createElement("img");
    image.className = "car-image";
    image.src = `https://images.unsplash.com/${car.image}?auto=format&fit=crop&w=900&q=80`;
    image.alt = `${car.name} available to rent`;
    image.loading = index < visibleCarCount ? "eager" : "lazy";
    image.width = 900;
    image.height = 560;

    const details = document.createElement("div");
    details.className = "car-details";

    const topLine = document.createElement("div");
    topLine.className = "car-topline";
    const type = document.createElement("span");
    type.className = "car-type";
    type.textContent = car.type;
    const rating = document.createElement("span");
    rating.className = "car-rating";
    rating.innerHTML = '<span aria-hidden="true">★</span> Top pick';
    topLine.append(type, rating);

    const name = document.createElement("h3");
    name.className = "car-name";
    name.textContent = car.name;

    const features = document.createElement("p");
    features.className = "car-features";
    features.textContent = `${car.seats} seats · ${car.transmission}`;

    const bottomLine = document.createElement("div");
    bottomLine.className = "car-bottomline";
    const price = document.createElement("p");
    price.className = "car-price";
    price.innerHTML = `<strong>€${car.price}</strong><span> / day</span>`;

    const offerLink = document.createElement("a");
    offerLink.className = "offer-link";
    offerLink.href = "#booking";
    offerLink.textContent = "See offer";
    offerLink.setAttribute("aria-label", `See offer for ${car.name}`);
    bottomLine.append(price, offerLink);

    details.append(topLine, name, features, bottomLine);
    card.append(image, details);
    return card;
}

cars.forEach((car, index) => carGrid.append(createCarCard(car, index)));

showMoreButton.addEventListener("click", () => {
    const isExpanded = showMoreButton.getAttribute("aria-expanded") === "true";
    const nextExpanded = !isExpanded;

    carGrid.querySelectorAll(".extra-car").forEach((card) => {
        card.hidden = !nextExpanded;
    });

    showMoreButton.setAttribute("aria-expanded", String(nextExpanded));
    showMoreButton.innerHTML = nextExpanded
        ? 'Show fewer cars <span aria-hidden="true">↑</span>'
        : 'Show more cars <span aria-hidden="true">↓</span>';
    fleetCount.textContent = `Showing ${nextExpanded ? cars.length : visibleCarCount} of ${cars.length} cars`;
});

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("navigation-open", !isExpanded);
});

navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("navigation-open");
    });
});

const today = new Date();
const formatDate = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};
const pickupDate = document.querySelector("#date-from-input");
const dropoffDate = document.querySelector("#date-to-input");
const todayValue = formatDate(today);
const weekLater = new Date(today);
weekLater.setDate(weekLater.getDate() + 7);

pickupDate.min = todayValue;
pickupDate.value = todayValue;
dropoffDate.min = todayValue;
dropoffDate.value = formatDate(weekLater);

pickupDate.addEventListener("change", () => {
    dropoffDate.min = pickupDate.value || todayValue;
    if (dropoffDate.value && dropoffDate.value < dropoffDate.min) {
        dropoffDate.value = dropoffDate.min;
    }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
