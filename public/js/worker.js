// worker.js

onmessage = function(e) {
    const { resizedDetections, faceMatcher } = e.data
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    postMessage({ results, resizedDetections })
  }
  