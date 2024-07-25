document.addEventListener('DOMContentLoaded', function() {
    const csvTable = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
    const detailTable = document.getElementById('detailTable').getElementsByTagName('tbody')[0];
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
  
    axios.get('/api/v1/readcsv')
      .then(function (response) {
        const data = response.data;
        console.log(data)
        populateMainTable(data);
      })
      .catch(function (error) {
        console.error('Error fetching CSV data:', error);
      });
  
    function populateMainTable(data) {
      for (const [fileName, fileData] of Object.entries(data)) {
        const row = csvTable.insertRow();
        row.innerHTML = `
          <td>${fileName}</td>
          <td>${fileData.Label.length}</td>
          <td><button class="btn btn-primary btn-sm view-btn" data-file="${fileName}">View</button></td>
        `;
      }
  
      // Add event listeners to view buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const fileName = this.getAttribute('data-file');
          populateDetailTable(data[fileName]);
          document.getElementById('detailModalLabel').textContent = `CSV Details - ${fileName}`;
          modal.show();
        });
      });
    }
  
    function populateDetailTable(fileData) {
      detailTable.innerHTML = '';
      for (let i = 0; i < fileData.Label.length; i++) {
        const row = detailTable.insertRow();
        row.innerHTML = `
          <td>${fileData.Label[i]}</td>
          <td>${fileData.Time[i]}</td>
        `;
      }
    }
  });