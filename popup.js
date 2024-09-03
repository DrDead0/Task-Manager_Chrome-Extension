// Load tasks on startup
chrome.storage.local.get("tasks", function (result) {
    let tasks = result.tasks || [];
    renderTaskList(tasks);
});

// Add task
document.getElementById("addTask").addEventListener("click", function () {
    let title = document.getElementById("taskTitle").value;
    let dueDateString = document.getElementById("taskDate").value;
    let dueDate = new Date(dueDateString);

    if (title && dueDate && !isNaN(dueDate.getTime())) {
        chrome.storage.local.get("tasks", function (result) {
            let tasks = result.tasks || [];
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
        });
    } else {
        alert("Please enter a valid task title and due date.");
    }
});

// Clear completed tasks
document.getElementById("clearCompleted").addEventListener("click", function () {
    chrome.storage.local.get("tasks", function (result) {
        let tasks = result.tasks || [];
        tasks = tasks.filter((task) => !task.completed);
        chrome.storage.local.set({ tasks: tasks }, function () {
            renderTaskList(tasks);
            document.getElementById("clearCompleted").style.display = "none";
        });
    });
});

// Render task list
function renderTaskList(tasks) {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        let li = document.createElement("li");
        li.textContent = "No tasks yet! Add some to get started.";
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

            taskList.appendChild(li);
        });
    }

    // Show/hide "Clear Completed Tasks" button based on tasks
    document.getElementById("clearCompleted").style.display = tasks.some((task) => task.completed)
        ? "block"
        : "none";
}

// Theme toggle
const toggle = document.getElementById("toggle");

function setMode(isDark) {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggle.style.transform = isDark ? 'translateX(30px)' : 'translateX(0)';
    document.getElementById("extensionTitle").textContent = isDark ? 'Task Manager (Dark Mode)' : 'Task Manager';
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
