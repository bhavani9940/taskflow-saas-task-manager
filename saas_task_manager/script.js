// ============================================================
// TaskFlow SaaS Task Manager
// Production Capstone - JavaScript ES6+
// ============================================================

const state = {
    tasks: JSON.parse(localStorage.getItem("taskflow_tasks")) || [],
    filter: "all",
    search: ""
};

const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const taskSummary = document.getElementById("taskSummary");

const clearButton = document.getElementById("clearButton");
const themeButton = document.getElementById("themeButton");


// ------------------------------------------------------------
// Save state using browser localStorage
// ------------------------------------------------------------

function saveTasks() {
    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(state.tasks)
    );
}


// ------------------------------------------------------------
// Add new task
// ------------------------------------------------------------

function addTask() {

    const title = taskInput.value.trim();

    if (!title) {
        alert("Please enter a task.");
        taskInput.focus();
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        priority: priorityInput.value,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    state.tasks.unshift(task);

    saveTasks();

    taskInput.value = "";

    render();
}


// ------------------------------------------------------------
// Toggle task completion
// ------------------------------------------------------------

function toggleTask(id) {

    state.tasks = state.tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();

    render();
}


// ------------------------------------------------------------
// Delete task
// ------------------------------------------------------------

function deleteTask(id) {

    state.tasks = state.tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    render();
}


// ------------------------------------------------------------
// Clear completed tasks
// ------------------------------------------------------------

function clearCompleted() {

    state.tasks = state.tasks.filter(
        task => !task.completed
    );

    saveTasks();

    render();
}


// ------------------------------------------------------------
// Filter tasks
// ------------------------------------------------------------

function getVisibleTasks() {

    return state.tasks.filter(task => {

        const matchesFilter =
            state.filter === "all" ||
            (state.filter === "active" && !task.completed) ||
            (state.filter === "completed" && task.completed);

        const matchesSearch =
            task.title
                .toLowerCase()
                .includes(state.search.toLowerCase());

        return matchesFilter && matchesSearch;
    });
}


// ------------------------------------------------------------
// Render DOM
// ------------------------------------------------------------

function render() {

    const visibleTasks = getVisibleTasks();

    taskList.innerHTML = "";

    emptyState.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    visibleTasks.forEach(task => {

        const article = document.createElement("article");

        article.className =
            `task ${task.completed ? "completed" : ""}`;

        article.innerHTML = `
            <input
                class="task-check"
                type="checkbox"
                ${task.completed ? "checked" : ""}
                aria-label="Complete ${escapeHTML(task.title)}"
            >

            <div class="task-content">
                <p class="task-title">
                    ${escapeHTML(task.title)}
                </p>

                <div class="task-meta">
                    Created ${task.createdAt}
                </div>
            </div>

            <span class="priority ${task.priority}">
                ${task.priority}
            </span>

            <button class="delete"
                    aria-label="Delete task">
                ×
            </button>
        `;

        const checkbox =
            article.querySelector(".task-check");

        const deleteButton =
            article.querySelector(".delete");

        checkbox.addEventListener(
            "change",
            () => toggleTask(task.id)
        );

        deleteButton.addEventListener(
            "click",
            () => deleteTask(task.id)
        );

        taskList.appendChild(article);
    });

    updateStatistics();
}


// ------------------------------------------------------------
// Dashboard statistics
// ------------------------------------------------------------

function updateStatistics() {

    const total = state.tasks.length;

    const completed =
        state.tasks.filter(task => task.completed).length;

    const active = total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;

    progressText.textContent =
        `${percentage}%`;

    progressBar.style.width =
        `${percentage}%`;

    taskSummary.textContent =
        `${getVisibleTasks().length} task(s)`;
}


// ------------------------------------------------------------
// Search
// ------------------------------------------------------------

searchInput.addEventListener("input", event => {

    state.search = event.target.value;

    render();
});


// ------------------------------------------------------------
// Navigation filters
// ------------------------------------------------------------

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".nav-item")
            .forEach(item =>
                item.classList.remove("active")
            );

        button.classList.add("active");

        state.filter =
            button.dataset.filter;

        render();
    });
});


// ------------------------------------------------------------
// Theme switch
// ------------------------------------------------------------

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    themeButton.textContent =
        darkMode ? "☀️" : "🌙";

    localStorage.setItem(
        "taskflow_theme",
        darkMode ? "dark" : "light"
    );
});


// Restore theme
if (
    localStorage.getItem("taskflow_theme") === "dark"
) {
    document.body.classList.add("dark");
    themeButton.textContent = "☀️";
}


// ------------------------------------------------------------
// Button events
// ------------------------------------------------------------

addButton.addEventListener("click", addTask);

clearButton.addEventListener(
    "click",
    clearCompleted
);

taskInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        addTask();
    }
});


// ------------------------------------------------------------
// Basic HTML escaping
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ------------------------------------------------------------
// Initial render
// ------------------------------------------------------------

render();
