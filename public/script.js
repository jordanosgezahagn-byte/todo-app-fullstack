const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let tasksCache = [];

// Fetch tasks from backend
async function fetchTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasksCache = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';

    // Filter logic
    const filteredTasks = tasksCache.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li style="justify-content: center; color: #9ca3af; border: none; background: transparent;">No tasks found</li>`;
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        // Format Date nicely if it exists
        let formattedDate = '';
        if (task.due_date) {
            const dateObj = new Date(task.due_date);
            formattedDate = dateObj.toLocaleDateString();
        }

        li.innerHTML = `
            <div class="task-info">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id}, ${!task.completed})">
                <div class="task-text-group">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    ${formattedDate ? `<span class="task-date"><i class="fa-regular fa-calendar"></i> Due: ${formattedDate}</span>` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        taskList.appendChild(li);
    });

    // Update active tasks counter
    const activeCount = tasksCache.filter(t => !t.completed).length;
    taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} left`;
}

// Add a task
async function addTask() {
    const title = taskInput.value.trim();
    const due_date = dueDateInput.value;

    if (!title) return alert('Please enter a task title!');

    try {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, due_date })
        });

        taskInput.value = '';
        dueDateInput.value = '';
        fetchTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Toggle completion status (Tick/Untick)
async function toggleTask(id, completed) {
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        fetchTasks();
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        fetchTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Filter button event listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks();
    });
});

// Helper to prevent HTML injection bugs
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// Initial load
fetchTasks();