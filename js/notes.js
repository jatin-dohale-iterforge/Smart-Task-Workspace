// Function for get current date
const getDate = ()=>{
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'long' }) + ' ' + today.toLocaleDateString('en-US', { day: '2-digit' });
}

// function for clear form
 const clearFrom = ()=>{
    noteHeaderInput.value = "";
    noteTextArea.children[0].value = "";
    noteType.value = "";
    const orderItemBoxes = document.getElementById("order-item-box");

    orderItemBoxes.classList.add("d-none");
    noteTextArea.classList.add("d-none");
 }

//function of capitalize
const  capitalizeFirstLetter = (str) => {
if (!str) return ''; 
return str.charAt(0).toUpperCase() + str.slice(1);
}

//  function for show notes 
 const showNotes = (notesList) =>{
    notesBox.innerHTML = ""

    notesList.forEach(item =>{
  
        if(item.noteType == "simple"){
            notesBox.innerHTML +=`<div data-type="simple" class="box" onclick="editNote(this)">
              <div class="d-flex justify-between" >
                <h3>${capitalizeFirstLetter(item.header)}</h3>
                <span class="icon-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    style="opacity: 1; transform: rotate(0deg)"
                  >
                    <path
                      fill="currentColor"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4a1 1 0 0 1 1 1z"
                    ></path>
                  </svg>
                </span>
              </div>

              <p>
                ${item.data}
              </p>

              <span>${item.date}</span>
            </div>`
            
            
        }else if(item.noteType== "unordered"){
            notesBox.innerHTML += `<div data-type="unordered" class="box" onclick="editNote(this)">
              <div class="d-flex justify-between">
                <h3>Project Idea</h3>
                <span class="icon-container" onclick="pinnedList(this)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    style="opacity: 1; transform: rotate(0deg)"
                  >
                    <path
                      fill="currentColor"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4a1 1 0 0 1 1 1z"
                    ></path>
                  </svg>
                </span>
              </div>
              <ul class="ordered-list">
               ${item.data.map(i=>(` <li>${i}</li>`)).join("")}
              </ul>
              <span>${item.date}</span>
            </div>`
            
        }else if(item.noteType == "checkbox"){
            notesBox.innerHTML +=` <div data-type="checkbox" class="box" onclick="editNote(this)">
              <div class="d-flex justify-between">
                <h3>Meeting Notes</h3>
                <span class="icon-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    style="opacity: 1; transform: rotate(0deg)"
                  >
                    <path
                      fill="currentColor"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4a1 1 0 0 1 1 1z"
                    ></path>
                  </svg>
                </span>
              </div>

              <ul class="checkbox-list">
              ${item.data.map(i=>(
                `<li class="d-flex align-center gap-1">
                  <input type="checkbox" name="" id="1" />
                  <label for="1">${i}</label>
                </li>`
              )).join("")}
              </ul>

              <span>${item.date}</span>
            </div>`


        }
    })
}











const noteCreateBox = document.getElementById("note-create-box");
const overlayMainBox = document.getElementById("overlay-main-box")
const noteType = document.getElementById("note-type");
const noteTextArea= document.getElementById("note-input-taker");
const orderItemBox = document.getElementById("order-item-box");
const notesBox = document.getElementById("notes-box");



const notesList = localStorage.getItem("notesList") ? JSON.parse(localStorage.getItem("notesList")) : [] ;
const noteHeaderInput = document.getElementById("note-header-input");


showNotes(notesList)


// function for open overlay window
const toggleCreateWindow = () =>{
    overlayMainBox.classList.toggle("d-none")
}

const noteTypeHandler = (ele)=>{
    // console.log(ele.value == "simple")
    if(ele.value == "simple"){
        orderItemBox.classList.add("d-none");
        noteTextArea.classList.remove("d-none");
    }else if(ele.value == "unordered" || ele.value == "checkbox"){
        noteTextArea.classList.add("d-none");
        orderItemBox.classList.remove("d-none");
    }else{
        noteTextArea.classList.add("d-none");
        orderItemBox.classList.add("d-none");
    }
}


// function for handling Submit
const handleSubmit = (event) =>{
    event.preventDefault()
    if(noteType.value == "simple"){
        notesList.push({
            "header":noteHeaderInput.value,
            "noteType":noteType.value,
            "data": noteTextArea.children[0].value,
            "date":getDate(),
        })
    }else{
        let inputValueList = [];
        const orderItemInputs = document.querySelectorAll("#order-item-inputs input");

        orderItemInputs.forEach(item =>{
            inputValueList.push(item.value)
        })


         notesList.push({
            "header":noteHeaderInput.value,
            "noteType":noteType.value,
            "data": inputValueList,
            "date":getDate(),
        })
    }
    clearFrom();
    showNotes(notesList);
    localStorage.setItem("notesList",JSON.stringify(notesList))

}




// function for add another input
const addItemList = (ele) =>{
    ele.parentElement.insertAdjacentHTML("beforebegin",  ` <div class="d-flex align-center">
                      <input name="inputListitem" type="text" placeholder="Enter Note list..."/>
                      <span class="icon-container pointer" onclick="deleteItemList(this)">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="64" height="64" viewBox="0 0 24 24" style="opacity: 1; transform: rotate(0deg);"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"></path></svg>
                        </span>
                    </div>`)
    
}

const deleteItemList = (ele) =>{
    ele.parentElement.remove();
}


const cancelHandler = () =>{
  clearFrom();
  toggleCreateWindow();
  
}

const editNote = (ele) =>{
toggleCreateWindow();

noteHeaderInput.value = ele.children[0].children[0].innerText;
if(ele.dataset.type == "simple"){
  noteType.value = "simple";
  noteTextArea.classList.remove("d-none");
  noteTextArea.children[0].value = ele.children[1].innerText
}else if(ele.dataset.type == "unordered"){
  noteType.value = "unordered";
  console.log(noteHeaderInput)
}


}

