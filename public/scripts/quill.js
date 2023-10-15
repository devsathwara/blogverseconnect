
let toolbaroptions=[
    ["bold","italic","underline","strike"],
    [{header:[1,2,3,4,5,6,false]}],
    [{list:"ordered"},{list:"bullet"}],
    [{script:"sub"},{script:"super"}],
    [{indent:"+1"},{indent:"-1"}],
    [{align:[]}],
    ["link"],
    ["code-block","blockquote"]

  ]

var options = {
debug: 'info',
modules: {
  toolbar: toolbaroptions
},
placeholder: 'Compose a blog',
theme: 'snow'
};
var editor = new Quill('#editor', options);
const form = document.getElementById('writeForm');
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.querySelector('.writeInput[name="title"]').value;
    const content = editor.getContents();
    const fileInput = document.getElementById('fileInput');
    const categoriesCheckboxes = document.querySelectorAll('.categories:checked');
    const selectedCategories = Array.from(categoriesCheckboxes).map(checkbox => checkbox.value);
    
    const formData = new FormData();

    formData.append('title', title);
    formData.append('categories', selectedCategories);
    formData.append('content', JSON.stringify(content));
    formData.append('image', fileInput.files[0]);
    sendDataToServer(formData);
});

function sendDataToServer(formData) {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', '/save');
    // No need to set Content-Type for FormData, it will be automatically set

    xhr.onload = function() {
        if (xhr.status === 200) {
          console.log(xhr.responseText);
          const responseObj = JSON.parse(xhr.responseText);
          const postId = responseObj.postId;
          const title = responseObj.title;
          window.location.href = `/single?postId=${postId}&title=${title}`;
        } else {
            console.error('Request failed:', xhr.status, xhr.statusText);
        }
    };

    xhr.onerror = function() {
        console.error('Network error occurred');
    };

    xhr.send(formData);
}
function handleFileChange(event) {
  const selectedImage = document.getElementById('selectedImage');
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedImage.src = '';
  }
}