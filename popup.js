// popup.js

// Declare tasks globally
let tasks = [];

// Load tasks on startup
chrome.storage.local.get("tasks", function (result) {
    tasks = result.tasks || [];
    renderTaskList(tasks);
});

// Add task
document.getElementById("addTask").addEventListener("click", function () {
    let title = document.getElementById("taskTitle").value;
    let dueDateString = document.getElementById("taskDate").value;
    let dueDate = new Date(dueDateString);

    if (title && dueDate && !isNaN(dueDate.getTime())) {
        tasks.push({ title, dueDate: dueDateString, completed: false });
        chrome.storage.local.set({ tasks: tasks }, function () {
            renderTaskList(tasks);
            chrome.runtime.sendMessage({
                action: "createAlarm",
                title,
                dueDate: dueDateString,
            });
            document.getElementById("taskTitle").value = "";
            document.getElementById("taskDate").value = "";
        });
    } else {
        alert("Please enter a valid task title and due date.");
    }
});

// Edit task
function editTask(index) {
    let task = tasks[index];
    showEditPopup(task, index);
}

// Show Edit Popup
function showEditPopup(task, index) {
    const editPopup = document.getElementById("editPopup");
    editPopup.classList.remove("hidden");

    // Pre-fill edit form
    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDate").value = task.dueDate;

    // Save Edit
    document.getElementById("saveEdit").onclick = function () {
        const newTitle = document.getElementById("editTaskTitle").value;
        const newDate = document.getElementById("editTaskDate").value;

        if (newTitle && newDate) {
            tasks[index].title = newTitle;
            tasks[index].dueDate = newDate;
            chrome.storage.local.set({ tasks: tasks }, function () {
                renderTaskList(tasks);
                hideEditPopup();
            });
        } else {
            alert("Please enter a valid task title and due date.");
        }
    };

    // Cancel Edit
    document.getElementById("cancelEdit").onclick = function () {
        hideEditPopup();
    };
}

// Hide Edit Popup
function hideEditPopup() {
    const editPopup = document.getElementById("editPopup");
    editPopup.classList.add("hidden");
}

// Clear completed tasks
document.getElementById("clearCompleted").addEventListener("click", function () {
    tasks = tasks.filter((task) => !task.completed);
    chrome.storage.local.set({ tasks: tasks }, function () {
        renderTaskList(tasks);
        document.getElementById("clearCompleted").style.display = "none";
    });
});

// Render task list
function renderTaskList(tasks) {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        let li = document.createElement("li");
        li.textContent = "No tasks yet! Add some to get started.";
        li.classList.add("no-tasks");
        taskList.appendChild(li);
    } else {
        tasks.forEach(function (task, index) {
            let li = document.createElement("li");
            li.textContent = `${task.title} (Due: ${new Date(task.dueDate).toLocaleString()})`;

            if (task.completed) {
                li.classList.add("completed");
            }

            let completeButton = document.createElement("button");
            completeButton.textContent = task.completed ? "Incomplete" : "Complete";
            completeButton.addEventListener("click", function () {
                task.completed = !task.completed;
                chrome.storage.local.set({ tasks: tasks }, function () {
                    renderTaskList(tasks);
                });
            });
            li.appendChild(completeButton);

            let editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () {
                editTask(index);
            });
            li.appendChild(editButton);

            taskList.appendChild(li);
        });
    }

    document.getElementById("clearCompleted").style.display = tasks.some((task) => task.completed)
        ? "block"
        : "none";
}

// Theme toggle
const toggle = document.querySelector(".toggle-container");

function setMode(isDark) {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggle.querySelector('.toggle').style.transform = isDark ? 'translateX(30px)' : 'translateX(0)';
    document.getElementById("extensionTitle").textContent = 'Task Manager';
}

chrome.storage.local.get('darkMode', function(result) {
    const isDark = result.darkMode || false;
    setMode(isDark);
});

toggle.addEventListener('click', () => {
    chrome.storage.local.get('darkMode', function(result) {
        const isDark = result.darkMode || false;
        chrome.storage.local.set({ darkMode: !isDark }, function() {
            setMode(!isDark);
        });
    });
});
