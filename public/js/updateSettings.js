import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) =>{
  //type is data or password
  try {
    const url = type === 'password' ?
      "http://localhost:3000/api/v1/users/updateMyPassword" :
      "http://localhost:3000/api/v1/users/updateMe"
    const res =  await axios({
      method: 'PATCH',
      url: url,
      data: data
    })
    if (res.data.status ==="success"){
      showAlert("success","changes successfully saved" );
      window.setTimeout(() =>{
      }, 1000);
    }
    console.log(res)
  }
  catch (err){
    showAlert( "error", err.response.data.message)
  }
}