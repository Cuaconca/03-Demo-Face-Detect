// demo.js

const btnUpload = document.querySelector('#btnUpload')
const imageUpload = document.getElementById('imageUpload')
const progressBar = document.getElementById('progress-bar')
const containerResult = document.querySelector('.container-result')
const wrapperInfo = document.querySelector('.wrapper-info')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  containerResult.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas

  containerResult.append(`
    Ứng dụng đã sẵn sàng hoạt động
    `)

  btnUpload.removeAttribute('disabled')
  wrapperInfo.hidden = true

  const worker = new Worker('../../../js/worker.js')
  worker.onmessage = (e) => {
    const { results, resizedDetections } = e.data
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { 
        label: result._label.toString(),
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
  }

  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    image.className = 'img-fluid'
    image.style.width = '500px'
    image.style.height = '500px'
    image.style.objectFit = 'fill'
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    canvas.style.position = 'absolute'
    canvas.style.left = '0'
    canvas.style.right = '0'
    canvas.style.margin = 'auto'
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    worker.postMessage({ resizedDetections, faceMatcher })
  })
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
