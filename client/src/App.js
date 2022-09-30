import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [pic, setPic] = useState();
  const [allPics, setAllPics] = useState([]);
  //const [storedFormData, setStoredFormData] = useState("");
  const [sessionData, setSessionData] = useState("no session data");
  const [sessionSourceId, setSessionSourceId] = useState(
    "no session source ID"
  ); //Used to check status.
  const [sessionStatus, setSessionStatus] = useState(
    "No Status (pending/complete)"
  );
  const [sessionUrl, setSessionUrl] = useState("No session URL"); //Long amazon url
  useEffect(() => {
    getAllPics();
  }, [allPics, sessionData]);

  const getAllPics = async () => {
    await axios
      .get("http://localhost:5001/pictures")
      .then((res) => setAllPics(res.data))
      .catch((error) => console.log(error.message));
  };

  const handleDelete = async (name) => {
    await axios
      .delete("http://localhost:5001/delete", {
        data: { name: name },
      })
      .then(getAllPics())
      .catch((error) => console.log(error.message));
  };

  //FIREBASE EXAMPLE OF HANDLE SUBMIT + HANDLE CHANGE.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(); //https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
    console.log(formData);
    formData.append("pic", pic);
    await axios
      .post("http://localhost:5001/addPicture", formData)
      .then(getAllPics())
      .catch((error) => console.log(error.message));
  };
  const handleChange = (e) => {
    setPic(e.target.files[0]);
  };

  //IMGIX EXAMPLES OF BASIC UPLOAD. (NONE SESSION)
  const imgixHandleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(); //https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
    console.log("Below is the formData inside imgixHandleSubmit");
    formData.append("pic", pic);

    //BASIC UPLOAD NONE SESSION
    const test = await axios
      .post("http://localhost:5001/imgixAddPicture", formData)
      .then(console.log("starting imgix session"))
      .catch((error) => console.log(error.message));

    setSessionData(test);
  };
  const imgixHandleChange = (e) => {
    setPic(e.target.files[0]);
  };

  //IMGIX EXAMPLES: STARTING SESSION
  const imgixHandleSubmitForSessionStarting = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    console.log(
      "Below is the formData inside imgixHandleSubmitForSessionStarting"
    );
    formData.append("pic", pic);
    //setStoredFormData(formData); //Storing formData to use in other functions.

    //Starting session
    const test = await axios
      .post("http://localhost:5001/startImgixSession", formData)
      .then(console.log("starting imgix session"))
      .catch((error) => console.log(error.message));
    //Start session
    setSessionData(test);
    setSessionSourceId(test.data.data.attributes.id); //Stores session Source ID.
    setSessionStatus(test.data.data.attributes.status);
    setSessionUrl(test.data.data.attributes.url); //stores long Amazon URL
  };
  const imgixHandleChangeForSessionStarting = (e) => {
    setPic(e.target.files[0]);
  };

  //IMGIX EXAMPLE: CHECK SESSION STATUS
  const imgixHandleCheckStatus = async (e) => {
    e.preventDefault();
    console.log(
      "I'm in the client imgixHanldeCheckStatus and sessionSourceID is: " +
        sessionSourceId
    );
    const value = { grabbedSessionSourceID: sessionSourceId };

    //check session
    const sessionStatusForAxios = await axios
      .post("http://localhost:5001/checkImgixSessionStatus", value)
      .then(console.log("Check imgix session"))
      .catch((error) => console.log(error.message));

    console.log("sessionStatusForAxios.data.data.attributes.status is: ");
    console.log(sessionStatusForAxios.data.data.attributes.status);
    setSessionStatus(
      "Checked: " + sessionStatusForAxios.data.data.attributes.status
    );
  };

  return (
    <div className='app'>
      <div>
        <form className='form' onSubmit={handleSubmit}>
          <input type='file' onChange={handleChange} />
          <button>upload to Firebase</button>
        </form>

        <div className='imgsContainer'>
          {allPics &&
            allPics.map((p) => (
              <div className='imgItem' key={p.name}>
                <img className='img' src={p.url} alt='' />
                <button
                  className='imgButton'
                  onClick={() => handleDelete(p.name)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
      <form className='form' onSubmit={imgixHandleSubmit}>
        <input type='file' onChange={imgixHandleChange} />
        <button>Basic image upload, not a session</button>
      </form>
      <form className='form' onSubmit={imgixHandleSubmitForSessionStarting}>
        <input type='file' onChange={imgixHandleChangeForSessionStarting} />
        <button>Starting a session</button>
      </form>
      <button onClick={imgixHandleCheckStatus}>Check session status</button>

      {/* <button onClick={viewSessionData}>view session dataa</button> */}
      <h3>The sessionSourceId is: {sessionSourceId}</h3>
      <h3>The sessionStatus is: {sessionStatus}</h3>
      <h3>The sessionUrl is: {sessionUrl}</h3>
    </div>
  );
}

export default App;
