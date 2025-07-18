import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email,password) =>{
  try {
    const res =  await axios({
      method: 'POST',
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password

      }
    })
    if (res.data.status ==="success"){
      showAlert("success","logged in successfully" );
      window.setTimeout(() =>{
        location.assign('/');
      }, 1000);
    }
    console.log(res)
  }
  catch (err){
    showAlert( "error", err.response.data.message)
  }
  }

  export const logout = async () =>{
  try{
    const res = await axios({
      method: 'GET',
      url: "http://localhost:3000/api/v1/users/logout",
    });
    console.log(res.status, res.data)
    if (res.data.status ==="success"){
      showAlert("success","logged out successfully" );
      window.setTimeout(() =>{
        location.assign('/');
      }, 500);
    }
  }
  catch (err){
    showAlert( "error", err)
    }
  }

