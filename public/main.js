////////////////////////// Owner Ankit Dhatteral/////////////////////////////////


let todoItems = [];
// Select container element
const container = document.querySelector('.container');

// Function to render todo item on the screen
function renderTodo(todo) {
  // Persist todo items to local storage
  localStorage.setItem('todoItems', JSON.stringify(todoItems));

  const list = document.querySelector('.js-todo-list');
  const item = document.querySelector(`[data-key='${todo.id}']`);

  if (todo.deleted) {
    item.remove();
    if (todoItems.length === 0) list.innerHTML = '';
    return;
  }

  const isChecked = todo.checked ? 'done': '';
  const node = document.createElement("li");
  // Set attributes for todo item
  node.setAttribute('class', `todo-item droppable ${isChecked}`);
  node.setAttribute('data-key', todo.id);
  node.setAttribute('draggable', true);
  node.innerHTML = `
    <input id="${todo.id}" type="checkbox"/>
    <label for="${todo.id}" class="tick js-tick"></label>
    <span>${todo.text}</span>
    <button class="js-edit-todo">
    <svg><use href="#edit-icon"></use></svg>
    </button>
    <button class="image-todo js-image-todo">
    <svg><use href="#image-icon"></use></svg>
    </button>
    <button class="delete-todo js-delete-todo">
    <svg><use href="#delete-icon"></use></svg>
    </button>
  `;

  if (item) {
    list.replaceChild(node, item);
  } else {
    list.append(node);
  }

  // Enable drag and drop functionality using SortableJS library
  const sortable = Sortable.create(list);
}

// Function to mark todo item as done
function toggleDone(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  todoItems[index].checked = !todoItems[index].checked;
  renderTodo(todoItems[index]);

  const todo = todoItems[index];

  // Fetch request to update todo item status
  fetch('/mark-checked', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text();
  })
  .then(text => {
    todoItems.push(todo);
    renderTodo(todo);
    console.log(text);
  })
  .catch(err => {
    alert(err);
  }) 
}

// Function to add new todo item
function addTodo(text) {
  const todo = {
    text,
    checked: false,
    id: Date.now(),
  };

  const formData = new FormData();
  formData.append('id', todo.id);
  formData.append('text', todo.text);

  const fileInput = document.querySelector('.js-todo-input-file');
  if (fileInput.files[0]) {
    formData.append('image', fileInput.files[0]);
  }

  // Fetch request to add new todo item to database
  fetch('/add-todo', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text()
  })
  .then(text => {
    todoItems.push(todo);
    renderTodo(todo);
  })
  .catch(err => {
    alert(err);
  }) 
}

// Function to delete todo item
function deleteTodo(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  const todo = {
    deleted: true,
    ...todoItems[index]
  };
  todoItems = todoItems.filter(item => item.id !== Number(key));

  // Fetch request to delete todo item from database
  fetch('/delete-todo', {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text();
  })
  .then(text => {
    renderTodo(todo);
  })
  .catch(err => {
    alert(err);
  })
}

// Event listener to render existing todo items when page is reloaded
document.addEventListener('DOMContentLoaded', () => {
  const ref = localStorage.getItem('todoItems');
  if (ref) {
    todoItems = JSON.parse(ref);
    todoItems.forEach(t => {
      renderTodo(t);
    });
  }
});

// Event listener to add new todo item and reset input field
const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.js-todo-input');
  const text = input.value.trim();
  if (text !== '') {
    addTodo(text);
    input.value = '';
    input.focus();
  }
});

// Event listener to handle checkbox tick and delete todo item
const list = document.querySelector('.js-todo-list');
list.addEventListener('click', event => {
  if (event.target.classList.contains('js-tick')) {
    const itemKey = event.target.parentElement.dataset.key;
    toggleDone(itemKey);
  }
  
  if (event.target.classList.contains('js-delete-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    deleteTodo(itemKey);
  }
});

// Event listener to handle modification of todo item
list.addEventListener('click', event => {
  if (event.target.classList.contains('js-edit-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    const index = todoItems.findIndex(item => item.id === Number(itemKey));
    const todoText = todoItems[index].text;
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = todoText;
    inputField.classList.add('edit-input');
    event.target.parentElement.querySelector('span').replaceWith(inputField);
    inputField.focus();
    inputField.addEventListener('blur', () => {
      const newText = inputField.value.trim();
      updateTodoText(itemKey, newText);
    });
    inputField.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const newText = inputField.value.trim();
        updateTodoText(itemKey, newText);
      }
    });
  }
});

// Function to update todo text
function updateTodoText(key, newText) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  todoItems[index].text = newText;
  fetch('/edit-todo', {
    method: 'POST',
    body: JSON.stringify({ id: Number(key), newText }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(response.text());
    }
    return response.text();
  })
  .then(text => {
    renderTodo(todoItems[index]);
    console.log(text);
  })
  .catch(err => {
    alert(err);
  });
}
