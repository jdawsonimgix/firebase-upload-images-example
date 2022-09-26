const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { ref, uploadBytes, listAll, deleteObject } = require("firebase/storage");
const storage = require("./firebase");
const axios = require("axios").default;
var bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// multer
const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

//add a picture
app.post("/addPicture", upload.single("pic"), async (req, res) => {
  const file = req.file;
  console.log("Below is the file");
  console.log(file);
  const imageRef = ref(storage, file.originalname);
  const metatype = { contentType: file.mimetype, name: file.originalname };
  await uploadBytes(imageRef, file.buffer, metatype)
    .then((snapshot) => {
      res.send("uploaded!");
    })
    .catch((error) => console.log(error.message));
});

//get all pictures
app.get("/pictures", async (req, res) => {
  const listRef = ref(storage);
  let productPictures = [];
  await listAll(listRef)
    .then((pics) => {
      productPictures = pics.items.map((item) => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${item._location.bucket}/o/${item._location.path_}?alt=media`;
        return {
          url: publicUrl,
          name: item._location.path_,
        };
      });
      res.send(productPictures);
    })
    .catch((error) => console.log(error.message));
});

// delete a picture
app.delete("/delete", async (req, res) => {
  const deletePic = req.body.name;
  const deleteRef = ref(storage, deletePic);
  await deleteObject(deleteRef)
    .then(() => {
      res.send("deleted");
    })
    .catch((error) => console.log(error.message));
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log("Server has started on port " + PORT);
});
