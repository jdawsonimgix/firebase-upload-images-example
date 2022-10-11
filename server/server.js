const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { ref, uploadBytes, listAll, deleteObject } = require("firebase/storage");
const storage = require("./firebase");
const axios = require("axios").default;
var bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "500mb" }));
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

//Start a session.
app.post("/startImgixSession", upload.single("pic"), async (req, res) => {
  const file = req.file;
  console.log("STARTING IMGIX SESSION IN SERVER");
  var data = file;
  //console.log(file);

  //Example:
  //https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/a_pup.jpeg

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      file.originalname,
    headers: {
      Authorization: "Bearer ",
      "Content-Type": file.mimetype,
    },
    data: req.file.buffer,
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("successfully did /startImgixSession axios call");
      //console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });

  let trueFinal = {
    allData: final,
    theBufferReturned: req.file.buffer,
  };
  return res.status(200).send(trueFinal);
});

app.post("/postSession", upload.single("pic"), async (req, res) => {
  // let bufferForFormData = req.body.theFormData; //bufferData
  // let fileForFormData = req.body.theSessionPresignedUrl; //long Amazon URL
  // console.log("***************fileForFormData************** ");
  // console.log(bufferForFormData);
  // console.log(fileForFormData);

  let fileBufferData = req.file.buffer;
  // console.log(file);
  let theAWSurl = req.body.awsURL;
  // console.log(bodyStuff);

  var config = {
    method: "put",
    url: theAWSurl,
    headers: {
      "Content-Type": "image/jpeg",
    },
    data: fileBufferData,
  };

  let finalPost = await axios(config)
    .then(function (response) {
      console.log("inside the axios for /postSession");
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  return res.status(200).send(finalPost);
});

//Checks status of an imgix session.
app.post("/checkImgixSessionStatus", async (req, res) => {
  console.log("Checking imgix status in /checkImgixSessionStatus");
  const gssid = req.body.grabbedSessionSourceID;

  var config = {
    method: "get",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer ",
      "Content-Type": "application/json",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixSessionStatus");
      //console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

//Close a session
app.post("/checkImgixCloseSession", async (req, res) => {
  console.log("Checking imgix status in /checkImgixCloseSession");
  const gssid = req.body.grabbedSessionSourceID;
  console.log("The source ID inside the server /checkImgixCloseSession is:");
  console.log(gssid);

  var config = {
    method: "post",
    url:
      `https://api.imgix.com/api/v1/sources/62e31fcb03d7afea23063596/upload-sessions/` +
      gssid,
    headers: {
      Authorization: "Bearer ",
    },
  };

  let final = await axios(config)
    .then(function (response) {
      console.log("INSIDE THE .then() FOR /checkImgixCloseSession");
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
      return error;
    });
  return res.status(200).send(final);
});

/*
Firebase code below
//
//
//
//
//
*/

//get all pictures for Firebase
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

// delete a picture for Firebase
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

//https://docs.imgix.com/apis/management#asset-upload-using-sessions

//I don't think I'm grabbing the right binary?
//https://stackoverflow.com/questions/57692942/multer-uploads-binary-file-with-different-name-and-no-extension-instead-of-origi

//https://majeek.github.io/tutorials/react-redux-mongoose-boilerplate-basics/binary-data-upload-FormData-XMLHttpRequest-Multer/

//https://www.youtube.com/watch?v=EVOFt8Its6I
