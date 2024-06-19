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
        tasks.push({ title, dueDate });
        chrome.storage.local.set({ tasks: tasks }, function() { 
          // Ensure storage is updated before re-rendering and sending message
          renderTaskList(tasks); 
  
          // Send message to background script to schedule notification
          chrome.runtime.sendMessage({ 
            action: "createAlarm",
            title, 
            dueDate 
          });
  
          // Clear input fields
          document.getElementById("taskTitle").value = "";
          document.getElementById("taskDate").value = "";
        });
      });
    } else {
      // Handle invalid input (show error message, etc.)
      alert("Please enter a task title and due date.");
    }
  });
  
  // Render task list
  function renderTaskList(tasks) {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Clear the list before rendering
  
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
        chrome.storage.local.set({ tasks: tasks });
        renderTaskList(tasks); // Re-render the list
      });
      li.appendChild(completeButton);
  
      taskList.appendChild(li);
    });
  }
  