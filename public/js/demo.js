
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

  document.documentElement.style.overflow = 'auto'
  // containerResult.style 
  btnUpload.removeAttribute('disabled');
  // containerResult.style 
  btnUpload.removeAttribute('disabled');
  wrapperInfo.hidden = true
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    image.className = 'img-fluid'
    // image.style.maxWidth = '500px' // Giới hạn chiều rộng của ảnh
    image.style.maxHeight = '500px' // Giới hạn chiều cao của ảnh
    // image.style.objectFit = 'fill' // Giới hạn chiều cao của ảnh
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
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { 
        label: result._label.toString(),
        label: result._label.toString(),
        boxColor: 'rgba(0, 255, 0, 0.6)', // Màu sắc của hộp
        lineWidth: 2, // Độ dày của viền hộp
        drawLabelOptions: {
          fontSize: 16, // Kích thước font của nhãn
          fontStyle: 'Arial', // Kiểu font
          padding: 10, // Khoảng cách giữa nhãn và hộp
          backgroundColor: 'rgba(0, 0, 0, 0.5)' // Màu nền của nhãn
        }
      })
      drawBox.draw(canvas)
    })
  })
}

function loadLabeledImages() {
  const labels = labelsArr
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`../../labeled_images/${label}/${i}.jpg`)
        // const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
