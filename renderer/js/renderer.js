const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
      alertError('Please select an image file');
        return;
  }
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function(){
    widthInput.value = this.width;
    heightInput.value = this.height;
  }
  form.style.display = 'block';
  filename.innerHTML = file.name;
  outputPath.innerHTML = path.join(os.homedir(),'imageresizer');

}
// Send data to main
const sendImage = (e)=>{
  console.log(e)
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  console.log('in renderer\n',width , height , imgPath)
  if(!img.files[0]){
    alertError("Please Upload an image")
  }
  if(width === ""||height===""){
    alertError("Please Enter appropriate dimensions")
  }
 
  // Send to main using ipcRenderer
  ipcRenderer.send('image:resize',{
    imgPath,
    width,
    height
  })
}
// actch the img done event
ipcRenderer.on('image:done' ,() => alertSuccess(`Image resized to ${widthInput.value} x ${heightInput}`))



function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file['type'])
}
function alertError(message){
  Toastify.toast({
    text:message,
    duration:5000,
    close:false,
    style:{
      background:'red',
      color:'white',
      textAlign:'center'
    }
  })
}
function alertSuccess(message){
  Toastify.toast({
    text:message,
    duration:5000,
    close:false,
    style:{
      background:'green',
      color:'white',
      textAlign:'center'
    }
  })
}
// file load listener
img.addEventListener('change', loadImage);
// file resize listenr
form.addEventListener('submit' , sendImage);
