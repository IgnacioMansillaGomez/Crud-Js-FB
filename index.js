const db = firebase.firestore();
const taskForm = document.getElementById("task-form");
const taskContainer = document.getElementById("task-container");
let status = false;
let id = "";
//Creo la coleccion y le seteo el objeto que se va a enviar
const saveTask = (title, description) => {
  db.collection("tasks").doc().set({
    title,
    description,
  });
};

//Traigo las tasks que hay en coleccion
const onGetTasks = (callback) => db.collection("tasks").onSnapshot(callback);
const editTask = (id) => db.collection("tasks").doc(id).get();
const deleteTask = (id) => db.collection("tasks").doc(id).delete();
const updateTask = (id, updateTask) =>
  db.collection("tasks").doc(id).update(updateTask);

//Funcion ventana => dom cargado se ejecuta evento
window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTasks((querySnapshot) => {
    taskContainer.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const task = doc.data();
      task.id = doc.id;
      const elemento = `<div class="card card-body mt-2 border-info">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
          <div>
            <button class="btn btn-danger btn-delete" data-id="${task.id}">Borrar</button>
            <button class="btn btn-primary btn-edit" data-id="${task.id}">Editar</button>
          </div>
          </div>`;

      taskContainer.innerHTML += elemento;

      const btnsDelete = document.querySelectorAll(".btn-delete");
      btnsDelete.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          deleteTask(e.target.dataset.id);
        });
      });

      const btnsEdit = document.querySelectorAll(".btn-edit");
      btnsEdit.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const doc = await editTask(e.target.dataset.id);
          const task = doc.data();

          status = true;
          id = doc.id;

          taskForm["task-title"].value = task.title;
          taskForm["task-description"].value = task.description;
          taskForm["btn-task-form"].innerText = "Guardar cambios";
        });
      });
    });
  });
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskForm["task-title"];
  const description = taskForm["task-description"];

  if (!status) {
    await saveTask(title.value, description.value);
  } else {
    await updateTask(id, {
      title: title.value,
      description: description.value,
    });

    status = false;
    id = "";
    taskForm["btn-task-form"].innerText = "Agregar";
  }

  taskForm.reset();
  title.focus();
});
