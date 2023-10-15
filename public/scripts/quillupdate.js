

let toolbaroptions = [
    ["bold", "italic", "underline", "strike"],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "+1" }, { indent: "-1" }],
    [{ align: [] }],
    ["link"],
    ["code-block", "blockquote"],
  ];
  
  var options = {
    debug: "info",
    modules: {
      toolbar: toolbaroptions,
    },
    placeholder: "Compose a blog",
    theme: "snow",
  };
  var editor = new Quill("#editor", options);
  
  const form = document.getElementById("writeForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const postId = form.getAttribute("data-post-id"); // Get the post ID from the form
    const title = document.querySelector('.writeInput[name="title"]').value;
    const content = editor.getContents();
    const fileInput = document.getElementById("fileInput");
    const categoriesCheckboxes = document.querySelectorAll('.categories:checked');
    const selectedCategories = Array.from(categoriesCheckboxes).map(checkbox => checkbox.value);
    const formData = new FormData();
  
    formData.append("title", title);
    formData.append("bid", postId);
    formData.append("categories", selectedCategories);
    formData.append("content", JSON.stringify(content));
    formData.append("image", fileInput.files[0]);
  
    // Use the post ID to update the existing post
    updatePost(postId, formData);
  });
  
  function updatePost(postId, formData) {
    const xhr = new XMLHttpRequest();
  
    xhr.open("POST", `/update-blog/${postId}`);
    // No need to set Content-Type for FormData, it will be automatically set
  
    xhr.onload = function () {
        if (xhr.status === 200) {
          console.log(xhr.responseText);
      
          // Check if the response is valid JSON
          let responseObj;
          try {
            responseObj = JSON.parse(xhr.responseText);
          } catch (error) {
            console.error("Error parsing JSON:", error);
            // Handle the error or perform alternative actions
            return;
          }
      
          // Handle the successful update, e.g., redirect to the updated post
          const postId = responseObj.postId;
          const title = responseObj.title;
          window.location.href = `/single?postId=${postId}&title=${title}`;
        } else {
          console.error("Request failed:", xhr.status, xhr.statusText);
        }
      };
      
  
    xhr.onerror = function () {
      console.error("Network error occurred");
    };
  
    xhr.send(formData);
  }
  
  function handleFileChange(event) {
    const selectedImage = document.getElementById("selectedImage");
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        selectedImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      selectedImage.src = "";
    }
  }
  