(function () {
  let btn = document.querySelector("#button");
  let filebtn = document.querySelector("#fileButton");
  let divContainer = document.querySelector("#container");
  let divHeader = document.querySelector("#header");
  let divBreadcrumb = document.querySelector("#breadcrumb");
  let divOverlay = document.querySelector("#overlay");
  let rootPath = document.querySelector(".path");
  let newTemplate = document.querySelector("#templates");
  let textApp = document.querySelector("#app");
  let divAppTitle = document.querySelector("#app-title");
  let divAppMenuBar = document.querySelector("#app-menu-bar");
  let divAppBody = document.querySelector("#app-body");
  let appClose = document.querySelector("#app-close");

  let resources = [];
  let cPage = 0;
  let rid = 0;

  btn.addEventListener("click", addNewFolder);
  filebtn.addEventListener("click", addTextFile);
  rootPath.addEventListener("click", navigateBreadcrumb);
  appClose.addEventListener("click", closeApp);

  function closeApp(){
      divAppTitle.innerHTML = "";
      divAppTitle.setAttribute("rid", "");
      divAppBody.innerHTML = "";
      divAppMenuBar.innerHTML = "";
      textApp.style.display = "none";
      divOverlay.style.display = "none";
  }

  function addNewFolder() {
    let fname = prompt("Give a name to your folder");
    fname = fname.trim();

    if (!!fname) {
      let length = fname.length;
      if (length < 14) {
        let exists = resources.some(
          (r) => r.name == fname && r.pid == cPage && r.type == "folder"
        );

        if (!exists) {
          rid++;
          addFolderTOPage(rid, fname, cPage);

          resources.push({
            id: rid,
            name: fname,
            type: "folder",
            pid: cPage,
          });
          saveToStorage();
        } else {
          alert("Please try another name.This folder name already exists");
        }
      } else {
        alert("Name should have less than 14 characters init");
      }
    }
  }

  function addTextFile() {
    let fname = prompt("Give a name to your folder");
    fname = fname.trim();

    if (!!fname) {
      let length = fname.length;
      if (length < 14) {
        let exists = resources.some(
          (r) => r.name == fname && r.pid == cPage && r.type == "text-file"
        );

        if (!exists) {
          rid++;
          addTextFileTOPage(rid, fname, cPage);

          resources.push({
            id: rid,
            name: fname,
            type: "text-file",
            pid: cPage,
            isBold: false,
            isItalic: false,
            isUnderline: false,
            bgColor: "#FAEBD7",
            textColor: "#000000",
            fontFamily: "Arial",
            fontSize: 14,
            content: "",
          });
          saveToStorage();
        } else {
          alert("Please try another name.This file name already exists");
        }
      } else {
        alert("Name should have less than 14 characters init");
      }
    }
  }

  function renameFolder() {
    let divFolder = this.parentNode;
    let divName = divFolder.querySelector("[purpose='name']");
    let newName = prompt("Give another name to folder " + divName.innerHTML);
    newName = newName.trim();

    if (!!newName) {
      let exists = resources.some(
        (r) => r.name == newName && r.pid == cPage && r.type == "folder"
      );

      if (!exists) {
        divName.innerHTML = newName;

        let fid = parseInt(divFolder.getAttribute("rid"));
        let folder = resources.find((r) => r.id == fid);
        folder.name = newName;

        saveToStorage();
      } else {
        alert("Please try another name.This folder name already exists");
      }
    }
  }

  function renameTextFile() {
    let divTextFile = this.parentNode;
    let divName = divTextFile.querySelector("[purpose='name']");
    let newName = prompt("Give another name to file " + divName.innerHTML);
    newName = newName.trim();

    if (!!newName) {
      let exists = resources.some(
        (r) => r.name == newName && r.pid == cPage && r.type == "text-file"
      );

      if (!exists) {
        divName.innerHTML = newName;

        let fid = parseInt(divTextFile.getAttribute("rid"));
        let folder = resources.find((r) => r.id == fid);
        folder.name = newName;

        saveToStorage();
      } else {
        alert("Please try another name.This file name already exists");
      }
    }
  }

  function deleteFolder() {
    let divFolder = this.parentNode;
    let fid = parseInt(divFolder.getAttribute("rid"));
    let exists = resources.some((r) => r.pid == fid);

    let ans = confirm("Do you want to delete this folder?" + (exists ? " It consists other resorces inti." : ""));
    if (ans) {
      divContainer.removeChild(divFolder);
      deleteHelper(fid);
      saveToStorage();
    }
  }

  function deleteHelper(fid) {
    let exists = resources.filter((r) => r.pid == fid);
    exists.forEach((r) => {
      deleteHelper(r.id);
    });

    let idx = resources.findIndex((r) => r.id == fid);
    resources.splice(idx, 1);
  }

  function deleteTextFile() {
    let divTextFile = this.parentNode;
    let fid = parseInt(divTextFile.getAttribute("rid"));

    let ans = confirm("Do you want to delete this file?");
    if (ans) {
      divContainer.removeChild(divTextFile);

      let indx = resources.findIndex((r) => r.id == fid);
      resources.splice(indx, 1);
      saveToStorage();
    }
  }

  function backButtonFun() {
    let arr = document.querySelectorAll(".path");
    let num = arr.length - 2;
    cPage = arr[num].getAttribute("rid");

    divContainer.innerHTML = "";
    resources.forEach((r) => {
      if (r.pid == cPage) {
        if (r.type == "folder") {
          addFolderTOPage(r.id, r.name, r.pid);
        } else if (r.type == "text-file") {
          addTextFileTOPage(r.id, r.name, r.pid);
        }
      }
    });

    while (arr[num].nextSibling) {
      arr[num].parentNode.removeChild(arr[num].nextSibling);
    }
  }

  function navigateBreadcrumb() {
    cPage = parseInt(this.getAttribute("rid"));

    divContainer.innerHTML = "";
    resources.forEach((r) => {
      if (r.pid == cPage) {
        if (r.type == "folder") {
          addFolderTOPage(r.id, r.name, r.pid);
        } else if (r.type == "text-file") {
          addTextFileTOPage(r.id, r.name, r.pid);
        }
      }
    });

    while (this.nextSibling) {
      this.parentNode.removeChild(this.nextSibling);
    }
  }

  function viewFolder(evt) {
    let divEdit = this.querySelector("[action='edit']");
    let divDelete = this.querySelector("[action='delete']");
    let divName = this.querySelector("[purpose='name']");

    if (!(evt.target == divDelete || evt.target == divEdit)) {
      if (cPage == 0) {
        let bBtnTemplate = newTemplate.content.querySelector("[action='backButton']");
        let addBackBtn = document.importNode(bBtnTemplate, true);
        addBackBtn.addEventListener("click", backButtonFun);
        divBreadcrumb.appendChild(addBackBtn);
      }

      cPage = parseInt(this.getAttribute("rid"));
      let pathTemplate = newTemplate.content.querySelector(".path");
      let newPath = document.importNode(pathTemplate, true);

      newPath.innerHTML += divName.innerHTML;
      newPath.setAttribute("rid", cPage);
      newPath.addEventListener("click", navigateBreadcrumb);

      divBreadcrumb.appendChild(newPath);

      divContainer.innerHTML = "";
      resources.forEach((r) => {
        if (r.pid == cPage) {
          if (r.type == "folder") {
            addFolderTOPage(r.id, r.name, r.pid);
          } else if (r.type == "text-file") {
            addTextFileTOPage(r.id, r.name, r.pid);
          }
        }
      });
    }
  }

  function viewTextFile(evt) {
    let divEdit = this.querySelector("[action='edit']");
    let divDelete = this.querySelector("[action='delete']");
    let fname = this.querySelector("[purpose='name']");
    let fid = parseInt(this.getAttribute("rid"));

    if (!(evt.target == divDelete || evt.target == divEdit)) {
      let notepadMenuTemplate =
        newTemplate.content.querySelector(".notepad-menu");
      let notepadBodyTemplate =
        newTemplate.content.querySelector(".notepad-body");
      let divNotepadMenu = document.importNode(notepadMenuTemplate, true);
      let divNotepadBody = document.importNode(notepadBodyTemplate, true);

      divOverlay.style.display = "block";
      textApp.style.display = "block";
      divAppTitle.innerHTML = fname.innerHTML;
      divAppTitle.setAttribute("rid", fid);
      divAppMenuBar.innerHTML = "";
      divAppBody.innerHTML = "";
      divAppMenuBar.appendChild(divNotepadMenu);
      divAppBody.appendChild(divNotepadBody);

      let spanSave = divAppMenuBar.querySelector("[action='save']");
      let spanBold = divAppMenuBar.querySelector("[action='bold']");
      let spanItalic = divAppMenuBar.querySelector("[action='italic']");
      let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
      let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
      let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
      let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
      let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
      let spanDownload = divAppMenuBar.querySelector("[action='download']");
      let spanUpload = divAppMenuBar.querySelector("[action='forupload']");
      let textArea = divAppBody.querySelector("textarea");

      spanSave.addEventListener("click", saveNotepad);
      spanBold.addEventListener("click", makeNotepadBold);
      spanItalic.addEventListener("click", makeNotepadItalic);
      spanUnderline.addEventListener("click", makeNotepadUnderline);
      inputBGcolor.addEventListener("change", changeNotepadBGcolor);
      inputTextColor.addEventListener("change", changeNotepadTextColor);
      selectFontFamily.addEventListener("change", changeNotepadFontFamily);
      selectFontSize.addEventListener("change", changeNotepadFontSize);
      spanDownload.addEventListener("click", downloadNotepad);
      spanUpload.addEventListener("click", uploadNotepad);

      let resource = resources.find((r) => r.id == fid);
      spanBold.setAttribute("pressed", !resource.isBold);
      spanItalic.setAttribute("pressed", !resource.isItalic);
      spanUnderline.setAttribute("pressed", !resource.isUnderline);
      inputBGcolor.value = resource.bgColor;
      inputTextColor.value = resource.textColor;
      selectFontFamily.value = resource.fontFamily;
      selectFontSize.value = resource.fontSize;
      textArea.value = resource.content;

      spanBold.dispatchEvent(new Event("click"));
      spanItalic.dispatchEvent(new Event("click"));
      spanUnderline.dispatchEvent(new Event("click"));
      inputBGcolor.dispatchEvent(new Event("change"));
      inputTextColor.dispatchEvent(new Event("change"));
      selectFontFamily.dispatchEvent(new Event("change"));
      selectFontSize.dispatchEvent(new Event("change"));
    }
  }

  function downloadNotepad() {
    let divNotepadMenu = this.parentNode;
    let fid = parseInt(divAppTitle.getAttribute("rid"));
    let resource = resources.find((r) => r.id == fid);

    let strForDownload = JSON.stringify(resource);
    let encodedData = encodeURIComponent(strForDownload);

    let aDownload = divNotepadMenu.querySelector("a[purpose='download']");
    aDownload.setAttribute("href","data:text/json; charset=utf-8, " + encodedData);
    aDownload.setAttribute("download", resource.name + ".json");

    aDownload.click();
  }

  function uploadNotepad(){
      let divNotepadMenu = this.parentNode;
      let inputUpload = divNotepadMenu.querySelector("[action='upload']");
      inputUpload.click();

      inputUpload.addEventListener("change", function(){
        let file = window.event.target.files[0];
        let reader = new FileReader();
  
        reader.addEventListener("load", function(){
            let data = window.event.target.result;
            let resource = JSON.parse(data);
  
            let spanBold = divAppMenuBar.querySelector("[action='bold']");
            let spanItalic = divAppMenuBar.querySelector("[action='italic']");
            let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
            let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
            let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
            let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
            let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
            let spanDownload = divAppMenuBar.querySelector("[action='download']");
            let spanUpload = divAppMenuBar.querySelector("[action='forupload']");
            let inputUpload = divAppMenuBar.querySelector("[action='upload']");
            let textArea = divAppBody.querySelector("textarea");
  
            spanBold.setAttribute("pressed", !resource.isBold);
            spanItalic.setAttribute("pressed", !resource.isItalic);
            spanUnderline.setAttribute("pressed", !resource.isUnderline);
            inputBGcolor.value = resource.bgColor;
            inputTextColor.value = resource.textColor;
            selectFontFamily.value = resource.fontFamily;
            selectFontSize.value = resource.fontSize;
            textArea.value = resource.content;
  
            spanBold.dispatchEvent(new Event("click"));
            spanItalic.dispatchEvent(new Event("click"));
            spanUnderline.dispatchEvent(new Event("click"));
            inputBGcolor.dispatchEvent(new Event("change"));
            inputTextColor.dispatchEvent(new Event("change"));
            selectFontFamily.dispatchEvent(new Event("change"));
            selectFontSize.dispatchEvent(new Event("change"));
        })
        reader.readAsText(file);
      })
  }

  function saveNotepad() {
    let fid = parseInt(divAppTitle.getAttribute("rid"));
    let resource = resources.find((r) => r.id == fid);

    let spanBold = divAppMenuBar.querySelector("[action='bold']");
    let spanItalic = divAppMenuBar.querySelector("[action='italic']");
    let spanUnderline = divAppMenuBar.querySelector("[action='underline']");
    let inputBGcolor = divAppMenuBar.querySelector("[action='bg-color']");
    let inputTextColor = divAppMenuBar.querySelector("[action='fg-color']");
    let selectFontFamily = divAppMenuBar.querySelector("[action='font-family']");
    let selectFontSize = divAppMenuBar.querySelector("[action='font-size']");
    let textArea = divAppBody.querySelector("textarea");

    resource.isBold = spanBold.getAttribute("pressed") == "true";
    resource.isItalic = spanItalic.getAttribute("pressed") == "true";
    resource.isUnderline = spanUnderline.getAttribute("pressed") == "true";
    resource.bgColor = inputBGcolor.value;
    resource.textColor = inputTextColor.value;
    resource.fontFamily = selectFontFamily.value;
    resource.fontSize = selectFontSize.value;
    resource.content = textArea.value;

    saveToStorage();
  }

  function makeNotepadBold() {
    let textArea = divAppBody.querySelector("textarea");
    let isPressed = this.getAttribute("pressed") == "true";
    if (isPressed == false) {
      this.setAttribute("pressed", true);
      textArea.style.fontWeight = "bold";
    } else {
      this.setAttribute("pressed", false);
      textArea.style.fontWeight = "normal";
    }
  }

  function makeNotepadItalic() {
    let textArea = divAppBody.querySelector("textarea");
    let isPressed = this.getAttribute("pressed") == "true";
    if (isPressed == false) {
      this.setAttribute("pressed", true);
      textArea.style.fontStyle = "italic";
    } else {
      this.setAttribute("pressed", false);
      textArea.style.fontStyle = "normal";
    }
  }

  function makeNotepadUnderline() {
    let textArea = divAppBody.querySelector("textarea");
    let isPressed = this.getAttribute("pressed") == "true";
    if (isPressed == false) {
      this.setAttribute("pressed", true);
      textArea.style.textDecoration = "underline";
    } else {
      this.setAttribute("pressed", false);
      textArea.style.textDecoration = "none";
    }
  }

  function changeNotepadBGcolor() {
    let textArea = divAppBody.querySelector("textarea");
    let color = this.value;
    textArea.style.backgroundColor = color;
  }

  function changeNotepadTextColor() {
    let textArea = divAppBody.querySelector("textarea");
    let color = this.value;
    textArea.style.color = color;
  }

  function changeNotepadFontFamily() {
    let textArea = divAppBody.querySelector("textarea");
    let fontFamily = this.value;
    textArea.style.fontFamily = fontFamily;
  }

  function changeNotepadFontSize() {
    let fontSize = this.value;
    let textArea = divAppBody.querySelector("textarea");
    textArea.style.fontSize = fontSize + "px";
  }

  function addFolderTOPage(rid, fname, cPage) {
    let folderTemplate = newTemplate.content.querySelector(".newFolder");
    let divFolder = document.importNode(folderTemplate, true);

    let divName = divFolder.querySelector("[purpose='name']");
    let divDelete = divFolder.querySelector("[action='delete']");
    let divEdit = divFolder.querySelector("[action='edit']");

    divName.innerHTML = fname;
    divEdit.addEventListener("click", renameFolder);
    divDelete.addEventListener("click", deleteFolder);
    divFolder.addEventListener("click", viewFolder);
    divFolder.setAttribute("rid", rid);
    divFolder.setAttribute("pid", cPage);

    divContainer.appendChild(divFolder);
  }

  function addTextFileTOPage(rid, fname, cPage) {
    let textFileTemplate = newTemplate.content.querySelector(".newTextFile");
    let divTextFile = document.importNode(textFileTemplate, true);

    let divName = divTextFile.querySelector("[purpose='name']");
    let divDelete = divTextFile.querySelector("[action='delete']");
    let divEdit = divTextFile.querySelector("[action='edit']");

    divName.innerHTML = fname;
    divEdit.addEventListener("click", renameTextFile);
    divDelete.addEventListener("click", deleteTextFile);
    divTextFile.addEventListener("click", viewTextFile);
    divTextFile.setAttribute("rid", rid);
    divTextFile.setAttribute("pid", cPage);

    divContainer.appendChild(divTextFile);
  }

  function saveToStorage() {
    let rJson = JSON.stringify(resources);
    localStorage.setItem("data", rJson);
  }

  function loadFromStorage() {
    let rJson = localStorage.getItem("data");

    if (!!rJson) {
      resources = JSON.parse(rJson);

      resources.forEach((r) => {
        if (r.pid == cPage) {
          if (r.type == "folder") {
            addFolderTOPage(r.id, r.name, r.pid);
          } else if (r.type == "text-file") {
            addTextFileTOPage(r.id, r.name, r.pid);
          }
        }

        if (r.id > rid) {
          rid = r.id;
        }
      });
    }
  }

  loadFromStorage();
})();
