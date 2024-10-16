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
  const openWindowsBar = document.getElementById("open-windows");

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
    appWindow.dataset.appName = appName;
    appWindow.innerHTML = `
      <div class="app-title-bar">
        <span>${getAppTitle(appName)}</span>
        <div class="window-controls">
          <button class="minimize-button"><i class="fas fa-window-minimize"></i></button>
          <button class="maximize-button"><i class="fas fa-window-maximize"></i></button>
          <button class="close-button"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <div class="app-content">
        ${getAppContent(appName)}
      </div>
      <div class="resize-handle"></div>
    `;
    appWindows.appendChild(appWindow);

    // Add taskbar entry
    const taskbarEntry = document.createElement("div");
    taskbarEntry.className = "taskbar-entry";
    taskbarEntry.textContent = getAppTitle(appName);
    taskbarEntry.dataset.appName = appName;
    openWindowsBar.appendChild(taskbarEntry);

    // Handle window controls
    const closeButton = appWindow.querySelector(".close-button");
    const minimizeButton = appWindow.querySelector(".minimize-button");
    const maximizeButton = appWindow.querySelector(".maximize-button");

    closeButton.addEventListener("click", () => closeWindow(appWindow));
    minimizeButton.addEventListener("click", () => minimizeWindow(appWindow));
    maximizeButton.addEventListener("click", () => maximizeWindow(appWindow));

    // Handle window dragging
    makeDraggable(appWindow);

    // Handle window resizing
    makeResizable(appWindow);

    // Focus the new window
    focusWindow(appWindow);
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
    return `<p>Content for ${appName} app</p>`;
  }

  function makeDraggable(element) {
    const titleBar = element.querySelector(".app-title-bar");
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    titleBar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      focusWindow(element);
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";

      // Window snapping
      const snapThreshold = 20;
      const desktop = document.getElementById("desktop");
      const rect = element.getBoundingClientRect();
      const desktopRect = desktop.getBoundingClientRect();

      if (rect.left < desktopRect.left + snapThreshold)
        element.style.left = "0px";
      if (rect.top < desktopRect.top + snapThreshold) element.style.top = "0px";
      if (rect.right > desktopRect.right - snapThreshold)
        element.style.left = desktopRect.width - rect.width + "px";
      if (rect.bottom > desktopRect.bottom - snapThreshold)
        element.style.top = desktopRect.height - rect.height + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function makeResizable(element) {
    const resizeHandle = element.querySelector(".resize-handle");
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener("mousedown", initResize, false);

    function initResize(e) {
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(
        document.defaultView.getComputedStyle(element).width,
        10
      );
      startHeight = parseInt(
        document.defaultView.getComputedStyle(element).height,
        10
      );
      document.addEventListener("mousemove", resize, false);
      document.addEventListener("mouseup", stopResize, false);
    }

    function resize(e) {
      element.style.width = startWidth + e.clientX - startX + "px";
      element.style.height = startHeight + e.clientY - startY + "px";
    }

    function stopResize() {
      document.removeEventListener("mousemove", resize, false);
      document.removeEventListener("mouseup", stopResize, false);
    }
  }

  function closeWindow(window) {
    window.remove();
    const taskbarEntry = openWindowsBar.querySelector(
      `[data-app-name="${window.dataset.appName}"]`
    );
    if (taskbarEntry) taskbarEntry.remove();
  }

  function minimizeWindow(window) {
    window.style.display = "none";
    const taskbarEntry = openWindowsBar.querySelector(
      `[data-app-name="${window.dataset.appName}"]`
    );
    if (taskbarEntry) taskbarEntry.classList.remove("active");
  }

  function maximizeWindow(window) {
    window.classList.toggle("maximized");
    const maximizeButton = window.querySelector(".maximize-button i");
    maximizeButton.classList.toggle("fa-window-maximize");
    maximizeButton.classList.toggle("fa-window-restore");
  }

  function focusWindow(window) {
    document
      .querySelectorAll(".app-window")
      .forEach((w) => w.classList.remove("active"));
    window.classList.add("active");
    window.style.zIndex = getTopZIndex() + 1;
    const taskbarEntries = openWindowsBar.querySelectorAll(".taskbar-entry");
    taskbarEntries.forEach((entry) => entry.classList.remove("active"));
    const activeEntry = openWindowsBar.querySelector(
      `[data-app-name="${window.dataset.appName}"]`
    );
    if (activeEntry) activeEntry.classList.add("active");
  }

  function getTopZIndex() {
    const windows = document.querySelectorAll(".app-window");
    let topIndex = 0;
    windows.forEach((w) => {
      const zIndex = parseInt(window.getComputedStyle(w).zIndex, 10);
      if (zIndex > topIndex) topIndex = zIndex;
    });
    return topIndex;
  }

  // Handle taskbar entry clicks
  openWindowsBar.addEventListener("click", (e) => {
    const taskbarEntry = e.target.closest(".taskbar-entry");
    if (taskbarEntry) {
      const appName = taskbarEntry.dataset.appName;
      const appWindow = appWindows.querySelector(
        `.app-window[data-app-name="${appName}"]`
      );
      if (appWindow) {
        if (appWindow.style.display === "none") {
          appWindow.style.display = "block";
          focusWindow(appWindow);
        } else if (appWindow.classList.contains("active")) {
          minimizeWindow(appWindow);
        } else {
          focusWindow(appWindow);
        }
      }
    }
  });

  // ... (rest of the existing code)
});
