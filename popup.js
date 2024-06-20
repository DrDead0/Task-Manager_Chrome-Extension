// Load tasks on startup
chrome.storage.local.get("tasks", function(result) {
    let tasks = result.tasks || [];
    renderTaskList(tasks);
  });
  
  // Add task
  document.getElementById("addTask").addEventListener("click", function() {
    let title = document.getElementById("taskTitle").value;
    let dueDate = new Date(document.getElementById("taskDate").value);
  
    if (title && dueDate) {
      chrome.storage.local.get("tasks", function(result) {
        let tasks = result.tasks || [];
        tasks.push({ title, dueDate, completed: false }); // Initialize completed
        chrome.storage.local.set({ tasks: tasks }, function() { 
          renderTaskList(tasks); 
          // Only schedule alarm for new tasks, not when marking as complete/incomplete
          chrome.runtime.sendMessage({
            action: "createAlarm",
            title,
            dueDate: dueDate.toISOString() 
          });
          document.getElementById("taskTitle").value = "";
          document.getElementById("taskDate").value = "";
        });
      });
    } else {
      alert("Please enter a task title and due date.");
    }
  });
  
  // Clear completed tasks
  document.getElementById("clearCompleted").addEventListener("click", function() {
    chrome.storage.local.get("tasks", function(result) {
      let tasks = result.tasks || [];
      tasks = tasks.filter(task => !task.completed); 
      chrome.storage.local.set({ tasks: tasks });
      renderTaskList(tasks); 
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
      tasks.forEach(function(task, index) {
        let li = document.createElement("li");
        li.textContent = `${task.title} (Due: ${task.dueDate.toLocaleString()})`;
  
        // Add "completed" class if task is marked as done
        if (task.completed) {
          li.classList.add("completed");
        }
  
        // Mark as complete/incomplete button
        let completeButton = document.createElement("button");
        completeButton.textContent = task.completed ? "Incomplete" : "Complete";
        completeButton.addEventListener("click", function() {
          task.completed = !task.completed; // Toggle completion status
          chrome.storage.local.set({ tasks: tasks }); // Update storage
          renderTaskList(tasks); // Re-render the list
        });
        li.appendChild(completeButton);
  
        taskList.appendChild(li);
      });
    }
  
    // Add "Clear Completed Tasks" button only if there are completed tasks
    if (tasks.some(task => task.completed)) {
      let clearButton = document.createElement("button");
      clearButton.id = "clearCompleted";
      clearButton.textContent = "Clear Completed Tasks";
      taskList.parentNode.insertBefore(clearButton, taskList.nextSibling);
    }
  }
  