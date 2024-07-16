document.addEventListener("DOMContentLoaded", function() {
    axios.get('/api/v1/labels')
      .then(response => {
        const directoryInfo = response.data;
        populateTable(directoryInfo);
      })
      .catch(error => {
        console.error('Error fetching the labels:', error);
      });

    function populateTable(directoryInfo) {
      const tbody = document.getElementById('table-body');
      tbody.innerHTML = ''; // Clear existing table rows

      directoryInfo.arrLabel.forEach((label, index) => {
        const row = document.createElement('tr');
        
        // Ảnh thumbnail column
        const imgThumbCell = document.createElement('td');
        const imgThumbImg = document.createElement('img');
        imgThumbImg.className = 'avatar avatar-sm rounded-circle me-2';
        imgThumbImg.alt = '...';
        imgThumbImg.src = `${window.location.protocol}/${directoryInfo.arrImgThumb[index]}`; // Update src URL
        imgThumbCell.appendChild(imgThumbImg);
        row.appendChild(imgThumbCell);

        // Tên nhãn lớp column
        const nameLabelCell = document.createElement('td');
        nameLabelCell.textContent = label;
        row.appendChild(nameLabelCell);

        // Số lượng hình ảnh column
        const quantityCell = document.createElement('td');
        quantityCell.textContent = directoryInfo.quantityImg[index];
        row.appendChild(quantityCell);

        // Ngày khởi tạo column
        const createDateCell = document.createElement('td');
        createDateCell.textContent = directoryInfo.createDate[index];
        row.appendChild(createDateCell);


        // Action column
        const actionCell = document.createElement('td');
        actionCell.className = 'text-end';

        // View button
        // const viewLink = document.createElement('a');
        // viewLink.className = 'btn btn-sm btn-neutral';
        // viewLink.href = '#';
        // viewLink.textContent = 'View';
        // actionCell.appendChild(viewLink);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-square btn-neutral text-danger-hover';
        deleteBtn.type = 'button';
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'bi bi-trash';
        deleteBtn.appendChild(deleteIcon);
        actionCell.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm('Xác nhận bạn muốn xóa nhãn này?');
        if (confirmDelete) {
            axios.delete(`/api/v1/deletelabel/${encodeURIComponent(label)}`)
            .then(response => {
                console.log(response.data.message); // Assuming backend responds with a message
                // Optionally, update the UI or fetch labels again
                // For simplicity, reload the page
                alert('Xóa nhãn thành công!')
                location.reload();
            })
            .catch(error => {
                console.error('Error deleting label:', error);
                alert('Xóa nhãn không thành công, vui lòng thử lại.');
            });
        }
        });
        actionCell.appendChild(deleteBtn);

        row.appendChild(actionCell);
        tbody.appendChild(row);
      });
    }
  });