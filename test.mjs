import axios from "axios";
axios.post("http://localhost:5000/api/sync/google", { city: "chennai" })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
