// Selectors
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Load tasks from localStorage on page load
document.addEventListener("DOMContentLoaded", loadTasks);

// Event Listener for adding a new task
addTaskBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Task cannot be empty!");
    return;
  }

  addTask(taskText);
  saveTaskToLocalStorage(taskText);
  taskInput.value = "";
});

// Function to add a new task
function addTask(taskText) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");

  taskItem.innerHTML = `
    <span>${taskText}</span>
    <div class="task-actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;

  // Mark task as completed
  taskItem.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") {
      taskItem.classList.toggle("completed");
    }
  });

  // Edit task
  taskItem.querySelector(".edit-btn").addEventListener("click", () => {
    const newTaskText = prompt("Edit your task:", taskText);
    if (newTaskText) {
      taskItem.querySelector("span").textContent = newTaskText;
      updateTaskInLocalStorage(taskText, newTaskText);
    }
  });

  // Delete task
  taskItem.querySelector(".delete-btn").addEventListener("click", () => {
    taskItem.remove();
    deleteTaskFromLocalStorage(taskText);
  });

  taskList.appendChild(taskItem);
}

// Save task to localStorage
function saveTaskToLocalStorage(taskText) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(addTask);
}

// Update task in localStorage
function updateTaskInLocalStorage(oldTask, newTask) {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  const taskIndex = tasks.indexOf(oldTask);
  if (taskIndex !== -1) {
    tasks[taskIndex] = newTask;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

// Delete task from localStorage
function deleteTaskFromLocalStorage(taskText) {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks = tasks.filter((task) => task !== taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
