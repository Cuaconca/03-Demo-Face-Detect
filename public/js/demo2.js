// const video = document.getElementById('video')
// const canvas = document.getElementById('canvas')
// const startButton = document.getElementById('startButton')
// const stopButton = document.getElementById('stopButton')
// const containerResult = document.querySelector('.container-result')
// const wrapperInfo = document.querySelector('.wrapper-info')

// let stream
// let isRunning = false
// let lastLabel = null
// let debounceTimer = null
// let isConfirming = false
// const DEBOUNCE_DELAY = 2000 // 2 seconds

// Promise.all([
//   faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
// ]).then(start)

// async function start() {
//   const labeledFaceDescriptors = await loadLabeledImages()
//   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)

//   containerResult.innerHTML = 'Ứng dụng đã sẵn sàng hoạt động'
//   document.documentElement.style.overflow = 'auto'
//   startButton.removeAttribute('disabled')
//   wrapperInfo.hidden = true

//   startButton.addEventListener('click', startVideo)
//   stopButton.addEventListener('click', stopVideo)

//   video.addEventListener('play', () => {
//     const displaySize = { width: video.width, height: video.height }
//     faceapi.matchDimensions(canvas, displaySize)

//     setInterval(async () => {
//       if (!isRunning) return

//       const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
//       const resizedDetections = faceapi.resizeResults(detections, displaySize)
//       const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

//       canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

//       if (results.length === 0) {
//         debounceLabel(null)
//       } else {
//         results.forEach((result, i) => {
//           if (result._label !== 'unknown') {
//             debounceLabel(result._label)
//           } else {
//             result._label = ''
//             debounceLabel(null)
//           }

//           const box = resizedDetections[i].detection.box
//           const drawBox = new faceapi.draw.DrawBox(box, { 
//             label: result._label.toString(),
//             boxColor: 'rgba(0, 255, 0, 0.6)',
//             lineWidth: 2,
//             drawLabelOptions: {
//               fontSize: 16,
//               fontStyle: 'Arial',
//               padding: 10,
//               backgroundColor: 'rgba(0, 0, 0, 0.5)'
//             }
//           })
//           drawBox.draw(canvas)
//         })
//       }
//     }, 100)
//   })
// }

// function debounceLabel(label) {
//   if (!isRunning) return  // Add this line to prevent debounce from running when video is stopped

//   if (label === lastLabel && label !== null) {
//     if (!isConfirming) {
//       isConfirming = true
//       clearTimeout(debounceTimer)
//       debounceTimer = setTimeout(() => {
//         if (lastLabel === label && isRunning) {  // Check if still running
//           console.log('Label confirmed:', label)
//           handleLabelConfirmed(label)
//         }
//         isConfirming = false
//       }, DEBOUNCE_DELAY)
//     }
//   } else {
//     clearTimeout(debounceTimer)
//     isConfirming = false
//     lastLabel = label
//   }
// }

// function handleLabelConfirmed(label) {
//   stopVideo()
//   addLabelToTable(label)
//   updateCsvFile(label)
// }

// async function startVideo() {
//   if (isRunning) return
  
//   try {
//     stream = await navigator.mediaDevices.getUserMedia({ video: {} })
//     video.srcObject = stream
//     isRunning = true
//     startButton.disabled = true
//     stopButton.disabled = false
//   } catch (err) {
//     console.error('Error accessing the camera:', err)
//     containerResult.innerHTML = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.'
//   }
// }

// function stopVideo() {
//   if (!isRunning) return

//   const tracks = stream.getTracks()
//   tracks.forEach(track => track.stop())
//   video.srcObject = null
//   isRunning = false
//   startButton.disabled = false
//   stopButton.disabled = true
//   canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//   lastLabel = null
//   clearTimeout(debounceTimer)
//   isConfirming = false
// }

// function loadLabeledImages() {
//   const labels = labelsArr
//   return Promise.all(
//     labels.map(async label => {
//       const descriptions = []
//       for (let i = 1; i <= 2; i++) {
//         const img = await faceapi.fetchImage(`../../labeled_images/${label}/${i}.jpg`)
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//         descriptions.push(detections.descriptor)
//       }
//       return new faceapi.LabeledFaceDescriptors(label, descriptions)
//     })
//   )
// }

// function addLabelToTable(label) {
//   const table = document.getElementById('labelTable')
//   const newRow = table.insertRow(0) // Insert at the top of the table
//   const labelCell = newRow.insertCell(0)
//   const timeCell = newRow.insertCell(1)

//   labelCell.textContent = label
//   timeCell.textContent = new Date().toLocaleString('vi-VN', { 
//     hour: '2-digit', 
//     minute: '2-digit',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   })

//   // Apply a fade-in effect to the new row
//   newRow.style.opacity = '0'
//   newRow.style.transition = 'opacity 0.5s'
//   setTimeout(() => {
//     newRow.style.opacity = '1'
//   }, 10)
// }

// function updateCsvFile(label) {
//   const time = new Date().toLocaleString('vi-VN', { 
//     hour: '2-digit', 
//     minute: '2-digit',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   })

//   axios.post('/api/v1/updatecsv', { label, time })
//     .then(response => {
//       console.log('CSV updated successfully:', response.data)
//     })
//     .catch(error => {
//       console.error('Error updating CSV:', error)
//     })
// }

// function downloadCSV() {
//   const table = document.getElementById('labelTable')
//   let csv = 'Nhãn,Thời gian Checkin\n'

//   for (let i = 0; i < table.rows.length; i++) {
//     let row = table.rows[i]
//     let label = row.cells[0].innerText
//     let time = row.cells[1].innerText
//     csv += `${label},${time}\n`
//   }

//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//   const link = document.createElement('a')
//   if (link.download !== undefined) {
//     const url = URL.createObjectURL(blob)
//     link.setAttribute('href', url)
//     link.setAttribute('download', 'checkin_data.csv')
//     link.style.visibility = 'hidden'
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }
// }

// document.getElementById('downloadCSV').addEventListener('click', downloadCSV)
const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const startButton = document.getElementById('startButton')
const stopButton = document.getElementById('stopButton')
const containerResult = document.querySelector('.container-result')
const wrapperInfo = document.querySelector('.wrapper-info')

let stream
let isRunning = false
let lastLabel = null
let debounceTimer = null
let isConfirming = false
const DEBOUNCE_DELAY = 2000 // 2 seconds

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)

  containerResult.innerHTML = 'Ứng dụng đã sẵn sàng hoạt động'
  document.documentElement.style.overflow = 'auto'
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

      if (results.length === 0) {
        debounceLabel(null)
      } else {
        results.forEach((result, i) => {
          if (result._label !== 'unknown') {
            debounceLabel(result._label)
          } else {
            result._label = ''
            debounceLabel(null)
          }

          if (isRunning) {
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
          }
        })
      }
    }, 100)
  })
}

function debounceLabel(label) {
  if (!isRunning) return

  if (label === lastLabel && label !== null) {
    if (!isConfirming) {
      isConfirming = true
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (lastLabel === label && isRunning) {
          console.log('Label confirmed:', label)
          handleLabelConfirmed(label)
        }
        isConfirming = false
      }, DEBOUNCE_DELAY)
    }
  } else {
    clearTimeout(debounceTimer)
    isConfirming = false
    lastLabel = label
  }
}

function handleLabelConfirmed(label) {
  stopVideo()
  addLabelToTable(label)
  updateCsvFile(label)
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
  lastLabel = null
  clearTimeout(debounceTimer)
  isConfirming = false
}

function loadLabeledImages() {
  const labels = labelsArr
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 1; i++) {
        const img = await faceapi.fetchImage(`../../labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function addLabelToTable(label) {
  const table = document.getElementById('labelTable')
  const newRow = table.insertRow(0)
  const labelCell = newRow.insertCell(0)
  const timeCell = newRow.insertCell(1)

  labelCell.textContent = label
  timeCell.textContent = new Date().toLocaleString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  newRow.style.opacity = '0'
  newRow.style.transition = 'opacity 0.5s'
  setTimeout(() => {
    newRow.style.opacity = '1'
  }, 10)
}

function updateCsvFile(label) {
  const time = new Date().toLocaleString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  axios.post('/api/v1/updatecsv', { label, time })
    .then(response => {
      console.log('CSV updated successfully:', response.data)
    })
    .catch(error => {
      console.error('Error updating CSV:', error)
    })
}

function downloadCSV() {
  const table = document.getElementById('labelTable')
  let csv = 'Nhãn,Thời gian Checkin\n'

  for (let i = 0; i < table.rows.length; i++) {
    let row = table.rows[i]
    let label = row.cells[0].innerText
    let time = row.cells[1].innerText
    csv += `${label},${time}\n`
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'checkin_data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

document.getElementById('downloadCSV').addEventListener('click', downloadCSV)