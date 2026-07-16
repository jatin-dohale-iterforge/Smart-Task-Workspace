// Function for get current date
const getDate = () => {
  try {
    const today = new Date();
    return (
      today.toLocaleDateString("en-US", { month: "long" }) +
      " " +
      today.toLocaleDateString("en-US", { day: "2-digit" })
    );
  } catch (error) {
    console.log("error : " , error.message)
  }
  };

// function for clear form
const clearFrom = () => {
  try {
  noteHeaderInput.value = "";
  noteTextArea.children[0].value = "";
  noteType.value = "";
  const orderItemBoxes = document.getElementById("order-item-box");
  const orderItemBoxesInput = document.querySelectorAll("#order-item-box input");
  orderItemBoxesInput.forEach(item=>{
    item.value =""
  })

  orderItemBoxes.classList.add("d-none");
  noteTextArea.classList.add("d-none");
  } catch (error) {
    console.log("error : " , error.message)
  }
};

//function of capitalize
const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const stopEventPropagation = (event)=>{
  event.stopPropagation()
}

//  function for show notes
const showNotes = (pinnedNoteList, notesList) => {
  notesBox.innerHTML = "";

  if(notesList.length == 0 && pinnedNoteList.length == 0){
    notesBox.innerHTML = `<div class="empty-workspace">
            <i class="fa fa-pencil-square-o"></i>
            <h3>No Note Found</h3>
            <p>
                Create a Note to start organizing your tasks.
            </p>
        
        </div>`
  }


  

  if (pinnedNoteList.length > 0) {
    let pinnedId = 0;
    pinnedNoteList.forEach((item) => {
      notesBox.innerHTML += `<div data-pinned-id=${pinnedId} class="box pinned"  ${
        item.noteType == "simple"
          ? `data-type="simple" `
          : item.noteType == "unordered"
            ? `data-type="unordered"`
            : `data-type="checkbox" `
      } onclick="editNote(this)">
              <div class="d-flex justify-between" >
                <h3>${capitalizeFirstLetter(item.header)}</h3>
                <div  class="d-flex gap-3" >
                  <i data-pinned-id=${pinnedId} class="fa fa-map-pin pinned-icon" onclick="removePinnedNote(event,this)"></i>
                  <i data-pinned-id=${pinnedId} class="fa fa-trash pointer"  onclick="openDeleteModal(event,this)"></i>
                </div>
              </div>

              ${
                item.noteType == "simple"
                  ? `<p>${item.data}</p>`
                  : item.noteType == "unordered"
                    ? `<ul class="ordered-list">
               ${item.data.map((i) => ` <li>${i}</li>`).join("")}
              </ul>`
                    : ` <ul class="checkbox-list" >
              ${item.data
                .map(
                  (i) => `<li class="d-flex align-center gap-1  onclick="stopEventPropagation(event)" >
                  <input type="checkbox" name="" id="1"  />
                  <label for="1">${i}</label>
                </li>`,
                )
                .join("")}
              </ul>`
              }


              <span class="dateTime">${item.date}</span>
            </div>`;
      pinnedId++;
    });
  }

  let id = 0;
  
  notesList = notesList.sort((a, b) => b.createdAt - a.createdAt);
  notesList.forEach((item) => {
    notesBox.innerHTML += `<div data-note-id=${id}  ${
      item.noteType == "simple"
        ? `data-type="simple" class="box simple"`
        : item.noteType == "unordered"
          ? `data-type="unordered" class="box unordered"`
          : `data-type="checkbox" class="box checkbox"`
    } onclick="editNote(this)">
              <div class="d-flex justify-between" >
                <h3>${capitalizeFirstLetter(item.header)}</h3>
                <div  class="d-flex gap-3" >
                  <i data-note-id=${id} class="fa fa-map-pin pointer" onclick="pinnedNote(event,this)"></i>
                  <i data-note-id=${id} class="fa fa-trash pointer"  onclick="openDeleteModal(event,this)"></i>
                </div>
              </div>

              ${
                item.noteType == "simple"
                  ? `<p>${item.data}</p>`
                  : item.noteType == "unordered"
                    ? `<ul class="ordered-list">
               ${item.data.map((i) => ` <li>${i}</li>`).join("")}
              </ul>`
                    : ` <ul class="checkbox-list">
              ${item.data
                .map(
                  (i) => `<li class="d-flex align-center gap-1">
                  <input type="checkbox" name="" id="1" />
                  <label for="1">${i}</label>
                </li>`,
                )
                .join("")}
              </ul>`
              }


              <span class="dateTime">${item.date}</span>
            </div>`;
    id++;
  });
};

// Variables
let edit;
const noteCreateBox = document.getElementById("note-create-box");
const overlayMainBox = document.getElementById("overlay-main-box");
const noteType = document.getElementById("note-type");
const noteTextArea = document.getElementById("note-input-taker");
const orderItemBox = document.getElementById("order-item-box");
const notesBox = document.getElementById("notes-box");

const pinnedNoteList = localStorage.getItem("pinnedNoteList")
  ? JSON.parse(localStorage.getItem("pinnedNoteList"))
  : [];
const notesList = localStorage.getItem("notesList")
  ? JSON.parse(localStorage.getItem("notesList"))
  : [];
const noteHeaderInput = document.getElementById("note-header-input");

showNotes(pinnedNoteList, notesList);

// function for open overlay window
const toggleCreateWindow = () => {
  overlayMainBox.classList.toggle("d-none");
};

const noteTypeHandler = (ele) => {
  if (ele.value == "simple") {
    orderItemBox.classList.add("d-none");
    noteTextArea.classList.remove("d-none");
  } else if (ele.value == "unordered" || ele.value == "checkbox") {
    noteTextArea.classList.add("d-none");
    orderItemBox.classList.remove("d-none");
  } else {
    noteTextArea.classList.add("d-none");
    orderItemBox.classList.add("d-none");
  }
};

// function for handling Submit
const handleSubmit = (event) => {
  event.preventDefault();
  if (edit != null) {
    notesList[edit.dataset.noteId] = {
      header: noteHeaderInput.value,
      noteType: noteType.value,
      data: noteTextArea.children[1].value,
      date: "last updated at " + getDate(),
      createdAt: Date.now(),
    };
    showToast("Note Edited Successfully")
  } else {
    if (noteType.value == "simple") {
      notesList.push({
        header: noteHeaderInput.value,
        noteType: noteType.value,
        data: noteTextArea.children[1].value,
        date: "created at " + getDate(),
        createdAt: Date.now(),
      });
    } else {
      let inputValueList = [];
      const orderItemInputs = document.querySelectorAll(
        "#order-item-inputs input",
      );

      orderItemInputs.forEach((item) => {
        inputValueList.push(item.value);
      });

      notesList.push({
        header: noteHeaderInput.value,
        noteType: noteType.value,
        data: inputValueList,
        date: "created at " + getDate(),
        createdAt: Date.now(),
      });
    }
    showToast("Note Created Successfully")
  }
  edit = null;
  clearFrom();
  toggleCreateWindow();
  showNotes(pinnedNoteList, notesList);
  localStorage.setItem("notesList", JSON.stringify(notesList));
};

// function for add another input
const addItemList = (ele) => {
  ele.parentElement.insertAdjacentHTML(
    "beforebegin",
    ` <div class="d-flex align-center">
                      <input name="inputListitem" type="text" placeholder="Enter Note list..."/>
                      <span class="icon-container pointer" onclick="deleteItemList(this)">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="64" height="64" viewBox="0 0 24 24" style="opacity: 1; transform: rotate(0deg);"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"></path></svg>
                        </span>
                    </div>`,
  );
};

// function for delete item in form
const deleteItemList = (ele) => {
  ele.parentElement.remove();
};

// function for handle cancel form
const cancelHandler = () => {
  clearFrom();
  toggleCreateWindow();
};

// function for handle edit
const editNote = (ele) => {
  if(ele.target.closes("input,label")) {return}
  edit = ele;
  toggleCreateWindow();
  noteHeaderInput.value = ele.children[0].children[0].innerText;
  
  if (ele.dataset.type == "simple") {
    noteType.value = "simple";
    noteTextArea.classList.remove("d-none");
    noteTextArea.children[1].value = ele.children[1].innerText;
  } else if (ele.dataset.type == "unordered") {
    noteType.value = "unordered";
  }
};

// functions for open delete modal
let deleteIndex;
function openDeleteModal(event, ele) {
  try {
    deleteIndex = ele.dataset.noteId;
    event.stopPropagation();
    const modal = document.querySelector("#deleteModal");
    modal.classList.add("show");
  } catch (e) {
    console.log("modal error:", e);
  }
}
// functions for close delete modal
function closeDeleteModal() {
  try {
    const modal = document.querySelector("#deleteModal");
    modal.classList.remove("show");
  } catch (e) {
    console.log("modal error:", e);
  }
}

// function for delete note
const deleteNote = () => {
  notesList.splice(deleteIndex, 1);
  localStorage.setItem("notesList", JSON.stringify(notesList));
  closeDeleteModal();
  showNotes(pinnedNoteList,notesList);
  showToast("Note Deleted Successfully")
};

// function for handle pinned note
const pinnedNote = (event, ele) => {
  try {
    event.stopPropagation();
    pinnedNoteList.unshift(notesList[ele.dataset.noteId]);
    notesList.splice(ele.dataset.noteId, 1);
    showNotes(pinnedNoteList, notesList);
    localStorage.setItem("notesList", JSON.stringify(notesList));
    localStorage.setItem("pinnedNoteList", JSON.stringify(pinnedNoteList));
  } catch (error) {
    console.log("pinnedNOte error:", error);
  }
};

// function for remove pinned note
const removePinnedNote = (event, ele) => {
  try {
    event.stopPropagation();
    notesList.push(pinnedNoteList[ele.dataset.pinnedId]);
    pinnedNoteList.splice(ele.dataset.pinnedId, 1);
    showNotes(pinnedNoteList, notesList);
    localStorage.setItem("notesList", JSON.stringify(notesList));
    localStorage.setItem("pinnedNoteList", JSON.stringify(pinnedNoteList));
  } catch (error) {
    console.log("pinnedNOte error:", error);
  }
};

// function for search
const renderItem = (str) => {
  str = str.toLowerCase().replaceAll(" ","");
  if (str == "") {
    showNotes(pinnedNoteList, notesList);
  } else {

    let filteredPinnedList = pinnedNoteList.filter((item) => {

      let stringData = Array.isArray(item.data)
        ? item.data.join(",").replaceAll(",", "")
        : item.data;
      let itemDate = item.date.split(" ").slice(2).reverse().join("");

      return (
        item.header.replaceAll(" ","").toLowerCase().includes(str) ||
        stringData.replaceAll(" ","").toLowerCase().includes(str) ||
        itemDate.toLowerCase().includes(str)
      );
    })



    let filteredNoteList = notesList.filter((item) => {

      let stringData = Array.isArray(item.data)
        ? item.data.join(",").replaceAll(",", "")
        : item.data;
      let itemDate = item.date.split(" ").slice(2).reverse().join("");

      return (
        item.header.replaceAll(" ","").toLowerCase().includes(str) ||
        stringData.replaceAll(" ","").toLowerCase().includes(str) ||
        itemDate.toLowerCase().includes(str)
      );
    });

    showNotes(filteredPinnedList,filteredNoteList);
  }
};


// Function for showing toast
function showToast(message, type = "success") {
    try {
        const toast = document.querySelector("#toast");
        if (!toast) return;
        toast.innerHTML = message;
        toast.className = `toast ${type}`;
        setTimeout(() => {
            toast.classList.add("show");
        }, 10);
        setTimeout(() => {
            toast.classList.remove("show");
        }, 5000);

    }
    catch (e) {
        console.log("Toast error:", e);
    }
}
