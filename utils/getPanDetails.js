import axios from "axios";
const getPanDetails = async ({
  panNumber = "ABCDE1234F",
  getStatusInfo = true,
}) => {
// let data = JSON.stringify({
//   panNumber: "ABCDE1234F",
//   getStatusInfo: true,
// });

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://api-preproduction.signzy.app/api/v3/panextensive",
  headers: {
    Authorization: "Ks7wDpfSe075bPYvWH6zzQHmoirMD51O",
    "Content-Type": "application/json",
  },
  data: {panNumber,getStatusInfo},
};

return await axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    return response.data
  })
  .catch((error) => {
    console.log(error);
  });
}
export { getPanDetails };
