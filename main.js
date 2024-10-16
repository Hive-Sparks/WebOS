document.addEventListener("DOMContentLoaded", function () {
  console.log("WebOS version 0.7 loaded successfully");

  // Update clock
  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US");
    const dateString = now.toLocaleDateString("en-US");
    document.getElementById(
      "clock"
    ).textContent = `${dateString} ${timeString}`;
  }

  setInterval(updateClock, 1000);
  updateClock(); // Initial call

  // Handle start menu button
  const startMenuButton = document.getElementById("start-menu-button");
  const startMenu = document.getElementById("start-menu");

  function toggleStartMenu() {
    startMenu.classList.toggle("visible");
    startMenu.classList.toggle("hidden");
  }

  startMenuButton.addEventListener("click", toggleStartMenu);

  // Close start menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !startMenu.contains(event.target) &&
      !startMenuButton.contains(event.target)
    ) {
      startMenu.classList.remove("visible");
      startMenu.classList.add("hidden");
    }
  });

  // Handle opening applications
  const startMenuItems = document.querySelectorAll(".start-menu-item");
  const appWindows = document.getElementById("app-windows");

  startMenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const appName = this.dataset.app;
      openApp(appName);
      toggleStartMenu();
    });
  });

  function openApp(appName) {
    const appWindow = document.createElement("div");
    appWindow.className = "app-window";
    appWindow.innerHTML = `
            <div class="app-title-bar">
                <span>${getAppTitle(appName)}</span>
                <button class="close-button"><i class="fas fa-times"></i></button>
            </div>
            <div class="app-content">
                ${getAppContent(appName)}
            </div>
        `;
    appWindows.appendChild(appWindow);

    // Handle window closing
    const closeButton = appWindow.querySelector(".close-button");
    closeButton.addEventListener("click", function () {
      appWindow.remove();
    });

    // Handle window dragging
    makeDraggable(appWindow);
  }

  function getAppTitle(appName) {
    const titles = {
      settings: "Settings",
      programs: "Programs",
      desktop: "Desktop",
      music: "Music",
      pictures: "Pictures",
      code: "Code",
      calculator: "Calculator",
      notepad: "Notepad",
      calendar: "Calendar",
    };
    return titles[appName] || appName;
  }

  function getAppContent(appName) {
    if (appName === "settings") {
      return `
        <h2 data-translate="settings"></h2>
        <div class="settings-section">
          <h3 data-translate="language"></h3>
          <div class="setting-item">
            <label for="language-select" data-translate="choose_language"></label>
            <select id="language-select">
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          <button id="apply-language" data-translate="apply"></button>
        </div>
        <div class="settings-section">
          <h3 data-translate="appearance"></h3>
          <div class="setting-item">
            <label for="theme-select" data-translate="choose_theme"></label>
            <select id="theme-select">
              <option value="dark" data-translate="dark_theme"></option>
              <option value="light" data-translate="light_theme"></option>
            </select>
          </div>
        </div>
        <div class="settings-section">
          <h3 data-translate="about"></h3>
          <p data-translate="version"></p>
          <p>Developer: Leon Yaakobov</p>
          <button id="check-updates" data-translate="check_updates"></button>
        </div>
      `;
    }
    // Other app contents...
  }

  function makeDraggable(element) {
    // ... (existing draggable functionality)
  }

  // Handle context menu (right-click)
  const contextMenu = document.getElementById("context-menu");

  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    const clickedElement = event.target.closest(".desktop-icon, .app-window");

    if (clickedElement) {
      contextMenu.style.display = "block";
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.top = `${event.clientY}px`;
    }
  });

  document.addEventListener("click", function () {
    contextMenu.style.display = "none";
  });

  // Handle context menu actions
  const contextMenuItems = document.querySelectorAll(".context-menu-item");
  contextMenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const action = this.dataset.action;
      const selectedElement = document.querySelector(
        ".desktop-icon.selected, .app-window.selected"
      );

      if (selectedElement) {
        switch (action) {
          case "rename":
            // Add rename logic here
            console.log("Rename");
            break;
          case "delete":
            selectedElement.remove();
            break;
          case "properties":
            // Add properties logic here
            console.log("Show properties");
            break;
        }
      }
    });
  });

  // Function to create a new file
  function createNewFile() {
    const fileName = prompt("Enter a name for the new file:");
    if (fileName) {
      const newFile = document.createElement("div");
      newFile.className = "desktop-icon";
      newFile.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${fileName}</span>
      `;
      desktop.appendChild(newFile);
    }
  }

  // Add create new file option to context menu
  const createFileMenuItem = document.createElement("div");
  createFileMenuItem.className = "context-menu-item";
  createFileMenuItem.textContent = "Create New File";
  createFileMenuItem.addEventListener("click", createNewFile);
  contextMenu.appendChild(createFileMenuItem);

  // ... (rest of the existing code)
});
