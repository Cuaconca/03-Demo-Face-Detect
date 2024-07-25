const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CLIENT_RENEG_LIMIT } = require("tls");
const cors = require("cors");
const moment = require('moment-timezone');
const app = express();
const port = 3000;

app.use(cors({
    // origin: 'http://localhost:5173',
    origin: '*',
    credentials: true,
}));

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `./public/labeled_images/${req.body.folderName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const dir = `./public/labeled_images/${req.body.folderName}`;
      fs.readdir(dir, (err, files) => {
        if (err) {
          return cb(err);
        }
        const index = files.length + 1;
        cb(null, `${index}.jpg`);
      });
    }
  });
const upload = multer({ storage });

const getDirectoryInfo = (dirPath) => {
    const labels = [];
    const quantities = [];
    const createDates = [];
    const imgThumbs = [];

    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        if (dirent.isDirectory()) {
            const label = dirent.name;
            labels.push(label);

            const labelPath = path.join(dirPath, label);
            const files = fs.readdirSync(labelPath);
            quantities.push(files.length.toString());

            // Get creation date of the first file in each folder
            const firstFile = files[0];
            const firstFilePath = path.join(labelPath, firstFile);
            const stats = fs.statSync(firstFilePath);
            const formattedDate = moment(stats.birthtime).tz('Asia/Bangkok').format('DD-MM-YYYY HH:mm');
            createDates.push({ label, date: formattedDate }); // Store as an object

            // Image thumbnail path
            const imgThumb = path.join('labeled_images', label, firstFile);
            imgThumbs.push(imgThumb);
        }
    });

    // Sort createDates array by date (newest to oldest)
    createDates.sort((a, b) => moment(b.date, 'DD-MM-YYYY HH:mm').toDate() - moment(a.date, 'DD-MM-YYYY HH:mm').toDate());

    // Extract sorted data
    const sortedLabels = createDates.map(item => item.label);
    const sortedQuantities = createDates.map(item => quantities[labels.indexOf(item.label)]);
    const sortedCreateDates = createDates.map(item => item.date);
    const sortedImgThumbs = createDates.map(item => imgThumbs[labels.indexOf(item.label)]);

    return {
        arrImgThumb: sortedImgThumbs,
        arrLabel: sortedLabels,
        quantityImg: sortedQuantities,
        createDate: sortedCreateDates,
    };
};

  
app.get("/api/v1/labels", (req, res) => {
    try {
        
        const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
        const directoryInfo = getDirectoryInfo(labeledImagesPath);
        // console.log(directoryInfo)
        res.status(200).json(directoryInfo)
    } catch (error) {
        console.log(error)
        res.status(200).json({
            message: false
        })
    }
});

// Route to delete a label
app.delete('/api/v1/deletelabel/:label', (req, res) => {
    const label = req.params.label;
    // console.log(label)
    const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
    const labelPath = path.join(labeledImagesPath, label);
    // console.log(labelPath)
    // Check if the folder exists
    if (fs.existsSync(labelPath)) {
      // Delete the folder
      fs.rmdirSync(labelPath, { recursive: true });
  
      res.status(200).json({
        message: `Deleted label '${label}' successfully.`
      });
    } else {
      res.status(404).json({
        message: `Label '${label}' not found.`
      });
    }
  });

// Routes
app.get("/api/v1/home", (req, res) => {
    res.render("./partials/header", {
        routes: {
            Upload: "/api/v1/showUploadPage",
            Demo: "/api/v1/demo",
        },
        page: 'home',
        title: 'Ứng dụng nhận diện khuôn mặt - Trang chủ'
    });
});

app.get("/api/v1/showUploadPage", (req, res) => {
    res.render("./partials/header", {
        routes: {
            Upload: "/api/v1/showUploadPage",
            Demo: "/api/v1/demo",
        },
        page: 'upload',
        title: 'Tải ảnh lên'
    });
});

app.get("/api/v1/demo", (req, res) => {
    try {
        const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
        var labels;
        fs.readdir(labeledImagesPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return console.error("Unable to scan directory:", err);
            }

            labels = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);


            res.render("./partials/header", {
                routes: {
                    Upload: "/api/v1/showUploadPage",
                    Demo: "/api/v1/demo",
                },
                page: 'demo',
                title: 'Nhận diện khuôn mặt',
                labels: JSON.stringify(labels)
            });
        });

    } catch (error) {
        console.log(error);
    }
});

app.get("/api/v1/demo2", (req, res) => {
    try {
        const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
        var labels;
        fs.readdir(labeledImagesPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return console.error("Unable to scan directory:", err);
            }

            labels = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);


            res.render("./partials/header", {
                routes: {
                    Upload: "/api/v1/showUploadPage",
                    Demo: "/api/v1/demo",
                },
                page: 'demo2',
                title: 'Nhận diện khuôn mặt',
                labels: JSON.stringify(labels)
            });
        });

    } catch (error) {
        console.log(error);
    }
});

app.get("/api/v1/demo", (req, res) => {
    try {
        const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
        var labels;
        fs.readdir(labeledImagesPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return console.error("Unable to scan directory:", err);
            }

            labels = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);


            res.render("./partials/header", {
                routes: {
                    Upload: "/api/v1/showUploadPage",
                    Demo: "/api/v1/demo",
                },
                page: 'demo',
                title: 'Nhận diện khuôn mặt',
                labels: JSON.stringify(labels)
            });
        });

    } catch (error) {
        console.log(error);
    }
});

app.post("/api/v1/upload", upload.single("image"), (req, res) => {
    res.json({ success: true, message: "Image uploaded successfully!" });
});

app.get("/api/v1/uploadcam", (req, res) => {
    try {
        const labeledImagesPath = path.join(__dirname, "/public/labeled_images");
        var labels;
        fs.readdir(labeledImagesPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                return console.error("Unable to scan directory:", err);
            }

            labels = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);


            res.render("./partials/header", {
                routes: {
                    Upload: "/api/v1/showUploadPage",
                    Demo: "/api/v1/demo",
                },
                page: 'uploadcam',
                title: 'Nhận diện khuôn mặt',
                labels: JSON.stringify(labels)
            });
        });

    } catch (error) {
        console.log(error);
    }
});

app.post("/api/v1/updatecsv", (req, res) => {
    const { label, time } = req.body;
    const date = moment().format('MM-DD-YYYY');
    const fileName = `Checkin ${date}.csv`;
    const dirPath = path.join(__dirname, 'public', 'csv');
    const filePath = path.join(dirPath, fileName);

    const csvLine = `${label},${time}\n`;

    // Ensure the directory exists
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            console.error("Error creating directory:", err);
            return res.status(500).json({ error: "Error creating directory" });
        }

        // Check if the file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File doesn't exist, create it with headers
                const headers = "Nhãn,Thời gian Checkin\n";
                fs.writeFile(filePath, headers + csvLine, (err) => {
                    if (err) {
                        console.error("Error creating file:", err);
                        return res.status(500).json({ error: "Error creating CSV" });
                    }
                    res.json({ message: "CSV created and updated successfully" });
                });
            } else {
                // File exists, append to it
                fs.appendFile(filePath, csvLine, (err) => {
                    if (err) {
                        console.error("Error appending to file:", err);
                        return res.status(500).json({ error: "Error updating CSV" });
                    }
                    res.json({ message: "CSV updated successfully" });
                });
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
