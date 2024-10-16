document.addEventListener("DOMContentLoaded", function () {
  console.log("WebOS version 0.8 loaded successfully");

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

    if (appName === "file-manager") {
      initializeFileManager(appWindow);
    }
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
    } else if (appName === "file-manager") {
      return `
        <div class="file-manager">
          <div class="file-manager-toolbar">
            <button id="back-button"><i class="fas fa-arrow-left"></i></button>
            <button id="forward-button"><i class="fas fa-arrow-right"></i></button>
            <button id="up-button"><i class="fas fa-level-up-alt"></i></button>
            <input type="text" id="path-input" readonly>
            <div class="file-manager-actions">
              <button id="new-folder-button"><i class="fas fa-folder-plus"></i> New Folder</button>
              <button id="upload-file-button"><i class="fas fa-file-upload"></i> Upload File</button>
              <input type="file" id="file-upload-input" style="display: none;" multiple>
            </div>
          </div>
          <div class="file-manager-content">
            <div id="folder-view"></div>
          </div>
          <div class="file-manager-status-bar">
            <span id="items-count">0 items</span>
            <span id="selected-count">0 selected</span>
          </div>
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

  function initializeFileManager(appWindow) {
    const folderView = appWindow.querySelector("#folder-view");
    const pathInput = appWindow.querySelector("#path-input");
    const backButton = appWindow.querySelector("#back-button");
    const forwardButton = appWindow.querySelector("#forward-button");
    const upButton = appWindow.querySelector("#up-button");
    const newFolderButton = appWindow.querySelector("#new-folder-button");
    const uploadFileButton = appWindow.querySelector("#upload-file-button");
    const fileUploadInput = appWindow.querySelector("#file-upload-input");
    const itemsCount = appWindow.querySelector("#items-count");
    const selectedCount = appWindow.querySelector("#selected-count");

    let currentPath = "/";
    let history = ["/"];
    let historyIndex = 0;
    let selectedItems = new Set();

    function updateFolderView() {
      folderView.innerHTML = "";
      pathInput.value = currentPath;

      // Simulated file system (replace with actual file system integration)
      const files = [
        { name: "Documents", type: "folder" },
        { name: "Pictures", type: "folder" },
        { name: "Music", type: "folder" },
        { name: "report.docx", type: "file" },
        { name: "presentation.pptx", type: "file" },
        { name: "budget.xlsx", type: "file" },
      ];

      files.forEach((file) => {
        const fileElement = document.createElement("div");
        fileElement.className = "file-item";
        fileElement.innerHTML = `
          <input type="checkbox" class="file-checkbox">
          <i class="fas ${
            file.type === "folder" ? "fa-folder" : "fa-file"
          }"></i>
          <span>${file.name}</span>
        `;
        fileElement.addEventListener("dblclick", () => {
          if (file.type === "folder") {
            navigateTo(currentPath + file.name + "/");
          }
        });
        fileElement.addEventListener("click", (e) => {
          if (e.target.classList.contains("file-checkbox")) {
            toggleItemSelection(fileElement, file.name);
          }
        });
        folderView.appendChild(fileElement);
      });

      updateStatusBar(files.length);
    }

    function navigateTo(path) {
      currentPath = path;
      history = history.slice(0, historyIndex + 1);
      history.push(path);
      historyIndex = history.length - 1;
      updateFolderView();
    }

    function toggleItemSelection(element, itemName) {
      if (selectedItems.has(itemName)) {
        selectedItems.delete(itemName);
        element.classList.remove("selected");
      } else {
        selectedItems.add(itemName);
        element.classList.add("selected");
      }
      updateStatusBar();
    }

    function updateStatusBar(totalItems = null) {
      if (totalItems !== null) {
        itemsCount.textContent = `${totalItems} item${
          totalItems !== 1 ? "s" : ""
        }`;
      }
      selectedCount.textContent = `${selectedItems.size} selected`;
    }

    backButton.addEventListener("click", () => {
      if (historyIndex > 0) {
        historyIndex--;
        currentPath = history[historyIndex];
        updateFolderView();
      }
    });

    forwardButton.addEventListener("click", () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        currentPath = history[historyIndex];
        updateFolderView();
      }
    });

    upButton.addEventListener("click", () => {
      const parentPath = currentPath.split("/").slice(0, -2).join("/") + "/";
      navigateTo(parentPath);
    });

    newFolderButton.addEventListener("click", () => {
      const folderName = prompt("Enter folder name:");
      if (folderName) {
        alert(`Created folder: ${folderName}`);
        updateFolderView();
      }
    });

    uploadFileButton.addEventListener("click", () => {
      fileUploadInput.click();
    });

    fileUploadInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        alert(`Uploaded ${files.length} file(s)`);
        updateFolderView();
      }
    });

    folderView.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    });

    function showContextMenu(x, y) {
      const contextMenu = document.createElement("div");
      contextMenu.className = "context-menu";
      contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="open">Open</div>
        <div class="context-menu-item" data-action="rename">Rename</div>
        <div class="context-menu-item" data-action="delete">Delete</div>
        <div class="context-menu-item" data-action="properties">Properties</div>
      `;
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      appWindow.appendChild(contextMenu);

      contextMenu.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        if (action) {
          handleContextMenuAction(action);
        }
        contextMenu.remove();
      });

      document.addEventListener("click", () => contextMenu.remove(), {
        once: true,
      });
    }

    function handleContextMenuAction(action) {
      switch (action) {
        case "open":
          alert("Opening selected items");
          break;
        case "rename":
          alert("Renaming selected items");
          break;
        case "delete":
          alert("Deleting selected items");
          break;
        case "properties":
          alert("Showing properties of selected items");
          break;
      }
    }

    updateFolderView();
  }

  // Day Clock Theme
  const dayClockThemes = {
    morning: {
      emoji: "🌅",
      name: "בוקר",
      colors: { primary: "#FFD700", secondary: "#87CEEB" },
    },
    noon: {
      emoji: "☀️",
      name: "צהריים",
      colors: { primary: "#FF8C00", secondary: "#F4A460" },
    },
    evening: {
      emoji: "🌇",
      name: "ערב",
      colors: { primary: "#FF4500", secondary: "#8B4513" },
    },
    night: {
      emoji: "🌙",
      name: "לילה",
      colors: { primary: "#191970", secondary: "#483D8B" },
    },
  };

  let currentTheme = "morning";

  function updateDayClockTheme() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      setTheme("morning");
    } else if (hour >= 12 && hour < 17) {
      setTheme("noon");
    } else if (hour >= 17 && hour < 21) {
      setTheme("evening");
    } else {
      setTheme("night");
    }
  }

  function setTheme(theme) {
    currentTheme = theme;
    const { emoji, colors } = dayClockThemes[theme];
    document.getElementById("day-clock-icon").textContent = emoji;

    // Update the theme stylesheet
    const themeStyle = document.getElementById("theme-style");
    themeStyle.href = `themes/${theme}.css`;

    updateDayClockWindow();
  }

  function createDayClockIcon() {
    const icon = document.createElement("div");
    icon.id = "day-clock-icon";
    icon.className = "taskbar-icon";
    icon.textContent = dayClockThemes[currentTheme].emoji;
    icon.addEventListener("click", toggleDayClockWindow);
    document.getElementById("system-tray").prepend(icon);
  }

  function createDayClockWindow() {
    const window = document.createElement("div");
    window.id = "day-clock-window";
    window.className = "day-clock-window hidden";
    window.innerHTML = `
      <div class="day-clock-grid">
        ${Object.entries(dayClockThemes)
          .map(
            ([key, { emoji, name }]) => `
          <div class="day-clock-item" data-theme="${key}">
            <span class="day-clock-emoji">${emoji}</span>
            <span class="day-clock-name">${name}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;
    document.body.appendChild(window);

    window.addEventListener("click", (e) => {
      const themeItem = e.target.closest(".day-clock-item");
      if (themeItem) {
        setTheme(themeItem.dataset.theme);
        toggleDayClockWindow();
      }
    });
  }

  function toggleDayClockWindow() {
    const window = document.getElementById("day-clock-window");
    window.classList.toggle("hidden");
  }

  function updateDayClockWindow() {
    const items = document.querySelectorAll(".day-clock-item");
    items.forEach((item) => {
      item.classList.toggle("active", item.dataset.theme === currentTheme);
    });
  }

  // Initialize day clock
  createDayClockIcon();
  createDayClockWindow();
  updateDayClockTheme();
  setInterval(updateDayClockTheme, 60000); // Update every minute

  // Notifications system
  const notificationsIcon = document.getElementById("notifications-icon");
  const notificationsPanel = document.getElementById("notifications-panel");
  const notificationsList = document.getElementById("notifications-list");
  const clearNotificationsButton = document.getElementById(
    "clear-notifications"
  );
  let notifications = [];

  notificationsIcon.addEventListener("click", toggleNotificationsPanel);
  clearNotificationsButton.addEventListener("click", clearNotifications);

  function toggleNotificationsPanel() {
    notificationsPanel.classList.toggle("hidden");
  }

  function addNotification(title, message) {
    const notification = {
      id: Date.now(),
      title,
      message,
      time: new Date().toLocaleTimeString(),
    };
    notifications.push(notification);
    updateNotificationsDisplay();
    showNotificationCount();
  }

  function updateNotificationsDisplay() {
    notificationsList.innerHTML = notifications
      .map(
        (notif) => `
      <div class="notification-item" data-id="${notif.id}">
        <div class="notification-title">${notif.title}</div>
        <div class="notification-message">${notif.message}</div>
        <div class="notification-time">${notif.time}</div>
      </div>
    `
      )
      .join("");
  }

  function showNotificationCount() {
    const count = notifications.length;
    notificationsIcon.setAttribute("data-count", count);
    notificationsIcon.style.setProperty("--count", `"${count}"`);
    if (count > 0) {
      notificationsIcon.style.setProperty("--display", "block");
    } else {
      notificationsIcon.style.setProperty("--display", "none");
    }
  }

  function clearNotifications() {
    notifications = [];
    updateNotificationsDisplay();
    showNotificationCount();
  }

  // Example usage:
  setTimeout(
    () => addNotification("ברוך הבא", "ברוכים הבאים ל-WebOS גרסה 0.8!"),
    3000
  );
  setTimeout(
    () => addNotification("עדכון זמין", "גרסה חדשה של WebOS זמינה להורדה."),
    10000
  );

  // ... (rest of the existing code) ...
});
