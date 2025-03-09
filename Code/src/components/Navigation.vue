<template>
  <nav>
    <label class="logo">Ufood</label>
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <a href="#" id="sign-link">Sign in</a>
      </li>
      <li style="display: none">
        <router-link to="/user" id="profile-link">Profile</router-link>
      </li>
      <li style="display: none">
        <span id="username-link" class="username-text-style">Daniel</span>
      </li>
      <li id="dropdown" class="search-dropdown"></li>
    </ul>
  </nav>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}

header {
  font-size: 2vw;
}

nav {
  background: #ffe8d6;
  height: 80px;
  width: 100%;
}

label.logo {
  color: black;
  font-size: 35px;
  line-height: 80px;
  padding: 0 30px;
  font-weight: bold;
}

nav ul {
  float: right;
  margin-right: 20px;
}

nav ul li {
  display: inline-block;
  line-height: 80px;
  margin: 0 5px;
}

nav ul li a {
  color: black;
  font-size: 17px;
  padding: 7px 13px;
  border-radius: 3px;
  text-transform: uppercase;
}

a:hover {
  background: rgba(128, 128, 128, 0.877);
  transition: 0.5s;
}

@media (max-width: 952px) {
  label.logo {
    font-size: 30px;
    padding-left: 50px;
  }
  nav ul li a {
    font-size: 16px;
  }
}

.search-dropdown input {
  margin: 0;
}

#dropdown-restaurants {
  position: absolute;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 50%;
  z-index: 100;
}

#dropdown-restaurants div {
  font-size: 1rem;
  padding: 0.5rem;
  cursor: pointer;
}

#dropdown-restaurants div:hover {
  background-color: #f0f0f0;
}

.no-results {
  font-size: 1rem;
  padding: 8px 10px;
}

.username-text-style {
  color: black;
  font-size: 17px;
  padding: 7px 13px;
  border-radius: 3px;
  text-transform: uppercase;
}
</style>

<script setup>
import { onMounted } from "vue";

function toggle() {
  const signLink = document.getElementById("sign-link");
  const profileLi = document.getElementById("profile-link").parentElement;
  const usernameLi = document.getElementById("username-link").parentElement;

  if (signLink) {
    signLink.addEventListener("click", (event) => {
      event.preventDefault();

      if (signLink.textContent === "Sign in") {
        signLink.textContent = "Sign off";
        profileLi.style.display = "";
        usernameLi.style.display = "";
      } else {
        signLink.textContent = "Sign in";
        profileLi.style.display = "none";
        usernameLi.style.display = "none";
      }
    });
  }
}

function showDropdown() {
  const dropdownElement = document.getElementById("dropdown");
  const inputElement = createInputElement();
  dropdownElement.appendChild(inputElement);
  const clearElement = createClearElement();
  dropdownElement.appendChild(clearElement);

  function createInputElement() {
    const element = document.createElement("input");
    element.setAttribute("placeholder", "search...");

    element.addEventListener("click", function () {
      const dropdown = document.getElementById("dropdown-restaurants");
      if (dropdown) {
        dropdown.remove();
      } else {
        filterAndRenderList();
      }
    });

    element.addEventListener("keyup", filterAndRenderList);

    element.addEventListener("focusout", () => {
      const dropdown = document.getElementById("dropdown-restaurants");
      if (dropdown) {
        dropdown.remove();
      }
    });

    return element;
  }

  function filterAndRenderList() {
    const dropdownRestaurants = document.getElementById("dropdown-restaurants");
    if (dropdownRestaurants) {
      dropdownRestaurants.remove();
    }
    const restaurantList = ["Contacts", "Home", "Profile", "Restaurant"];
    const restaurants = restaurantList.filter((restaurant) =>
      restaurant.startsWith(inputElement.value),
    );

    if (restaurants.length == 0) {
      const item = document.createElement("div");
      item.id = "dropdown-restaurants";
      item.className = "no-results";
      item.innerText = "no results found";
      dropdownElement.appendChild(item);
    } else {
      const items = document.createElement("div");
      items.id = "dropdown-restaurants";
      restaurants.forEach((restaurant) => {
        const item = document.createElement("div");
        item.innerText = restaurant;
        items.appendChild(item);
      });
      dropdownElement.appendChild(items);
    }
  }

  function createClearElement() {
    const clearElement = document.createElement("span");
    //clearElement.innerText = "   X";
    clearElement.style.cursor = "pointer";

    clearElement.addEventListener("click", function () {
      const dropdownRestaurants = document.getElementById(
        "dropdown-restaurants",
      );
      if (dropdownRestaurants) {
        dropdownRestaurants.remove();
      }
      inputElement.value = "";
    });
    return clearElement;
  }
}

onMounted(() => {
  showDropdown();
  toggle();
});
</script>
