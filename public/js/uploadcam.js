// const video = document.getElementById('video');
// const canvas = document.getElementById('canvas');
// const startButton = document.getElementById('startButton');
// const stopButton = document.getElementById('stopButton');
// const containerResult = document.querySelector('.container-result');
// const wrapperInfo = document.querySelector('.wrapper-info');

// let stream;
// let isRunning = false;

// Promise.all([
//   faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
// ]).then(start);

// async function start() {
//   containerResult.innerHTML = 'Ứng dụng đã sẵn sàng hoạt động';
//   startButton.removeAttribute('disabled');
//   wrapperInfo.hidden = true;

//   startButton.addEventListener('click', startVideo);
//   stopButton.addEventListener('click', stopVideo);

//   video.addEventListener('play', () => {
//     const displaySize = { width: video.width, height: video.height };
//     faceapi.matchDimensions(canvas, displaySize);

//     setInterval(async () => {
//       if (!isRunning) return;

//       const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
//       const resizedDetections = faceapi.resizeResults(detections, displaySize);

//       canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

//       if (resizedDetections.length > 0) {
//         faceapi.draw.drawDetections(canvas, resizedDetections);
//       }
//     }, 100);
//   });
// }

// async function startVideo() {
//   if (isRunning) return;

//   try {
//     stream = await navigator.mediaDevices.getUserMedia({ video: {} });
//     video.srcObject = stream;
//     isRunning = true;
//     startButton.disabled = true;
//     stopButton.disabled = false;
//   } catch (err) {
//     console.error('Error accessing the camera:', err);
//     containerResult.innerHTML = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.';
//   }
// }

// function stopVideo() {
//   if (!isRunning) return;

//   const tracks = stream.getTracks();
//   tracks.forEach(track => track.stop());
//   video.srcObject = null;
//   isRunning = false;
//   startButton.disabled = false;
//   stopButton.disabled = true;
//   canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
// }
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const containerResult = document.querySelector('.container-result');
const wrapperInfo = document.querySelector('.wrapper-info');

let stream;
let isRunning = false;

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

async function start() {
  containerResult.innerHTML = 'Ứng dụng đã sẵn sàng hoạt động';
  startButton.removeAttribute('disabled');
  wrapperInfo.hidden = true;

  startButton.addEventListener('click', startVideo);
  stopButton.addEventListener('click', stopVideo);

  video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (!isRunning) return;

      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        faceapi.draw.drawDetections(canvas, resizedDetections);
        captureImage();
      }
    }, 100);
  });
}

async function startVideo() {
  if (isRunning) return;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (err) {
    console.error('Error accessing the camera:', err);
    containerResult.innerHTML = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.';
  }
}

function stopVideo() {
  if (!isRunning) return;

  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
  video.srcObject = null;
  isRunning = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function captureImage() {
  const img = document.createElement('img');
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    img.src = url;
    addImageToCarousel(url);
  });
}

function addImageToCarousel(url) {
  const mainCarousel = document.querySelector('#main-carousel .splide__list');
  const thumbnailCarousel = document.querySelector('#thumbnail-carousel .splide__list');

  const mainSlide = document.createElement('li');
  mainSlide.classList.add('splide__slide');
  const mainImg = document.createElement('img');
  mainImg.src = url;
  mainSlide.appendChild(mainImg);
  mainCarousel.appendChild(mainSlide);

  const thumbnailSlide = document.createElement('li');
  thumbnailSlide.classList.add('splide__slide');
  const thumbImg = document.createElement('img');
  thumbImg.src = url;
  thumbnailSlide.appendChild(thumbImg);
  thumbnailCarousel.appendChild(thumbnailSlide);

  mainSplide.refresh();
  thumbSplide.refresh();
}

document.addEventListener('DOMContentLoaded', function () {
  window.mainSplide = new Splide('#main-carousel', {
    type       : 'fade',
    heightRatio: 0.5,
    pagination : false,
    arrows     : false,
    cover      : true,
  }).mount();

  window.thumbSplide = new Splide('#thumbnail-carousel', {
    fixedWidth  : 100,
    fixedHeight : 64,
    isNavigation: true,
    gap         : 10,
    focus       : 'center',
    pagination  : false,
    cover       : true,
    breakpoints : {
      600: {
        fixedWidth : 66,
        fixedHeight: 40,
      },
    },
  }).mount();

  mainSplide.sync(thumbSplide);
});
