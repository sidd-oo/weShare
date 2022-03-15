const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const host = "https://innshare.herokuapp.com/";
const uploadURL = host + "api/files";
const emailURL = host + "api/files/send";

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log(files);
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

browseBtn.addEventListener("click", (e) => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

copyBtn.addEventListener("click", () => {
  fileURLInput.select();
  document.execCommand("copy");
});

const uploadFile = () => {
  const file = fileInput.files[0];
  const formData = new FormData();

  progressContainer.style.display = "block";
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percentageProgress = Math.round((e.loaded / e.total) * 100);
  console.log(percentageProgress);
  bgProgress.style.width = `${percentageProgress}%`;
  percentDiv.innerText = percentageProgress;
  progressBar.style.transform = `scaleX(${percentageProgress}/100)`;
};

const onUploadSuccess = ({ file: url }) => {
  console.log(url);
  fileInput.value = "";
  emailForm.elements[2].removeAttribute("disabled");
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURLInput.value = url;
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = fileURLInput.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  emailForm.elements[2].setAttribute("disabled", "true");

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
      }
    });
});
