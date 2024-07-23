// demo.js

const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const startButton = document.getElementById('startButton')
const stopButton = document.getElementById('stopButton')
const containerResult = document.querySelector('.container-result')
const wrapperInfo = document.querySelector('.wrapper-info')

let stream
let isRunning = false

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {

  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  containerResult.innerHTML = 'Ứng dụng đã sẵn sàng hoạt động'
  startButton.removeAttribute('disabled')
  wrapperInfo.hidden = true

  startButton.addEventListener('click', startVideo)
  stopButton.addEventListener('click', stopVideo)

  video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
      if (!isRunning) return

      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { 
          label: result.toString(),
          boxColor: 'rgba(0, 255, 0, 0.6)',
          lineWidth: 2,
          drawLabelOptions: {
            fontSize: 16,
            fontStyle: 'Arial',
            padding: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        })
        drawBox.draw(canvas)
      })
    }, 100)
  })
}

async function startVideo() {
  if (isRunning) return
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    video.srcObject = stream
    isRunning = true
    startButton.disabled = true
    stopButton.disabled = false
  } catch (err) {
    console.error('Error accessing the camera:', err)
    containerResult.innerHTML = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.'
  }
}

function stopVideo() {
  if (!isRunning) return

  const tracks = stream.getTracks()
  tracks.forEach(track => track.stop())
  video.srcObject = null
  isRunning = false
  startButton.disabled = false
  stopButton.disabled = true
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

function loadLabeledImages() {
  const labels = labelsArr
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`../../labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}