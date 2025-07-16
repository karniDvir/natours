import { login } from './login';
import { displayMap } from './mapbox';
import '@babel/polyfill'
import { logout } from './login';
import { updateSettings } from './updateSettings';


document.addEventListener("DOMContentLoaded",  function () {

  //=========================================================================

  const mapElement = document.getElementById('map');
  const loginForm = document.querySelector('.form--login');
  const logoutBtn = document.querySelector('.nav__el--logout')
  const saveSettingsBtn = document.getElementById('save-settings');
  const savePasswordBtn = document.getElementById('save-settings-password')
  //const uploadNewPhoto = document.getElementById()


  if (mapElement) {
    let locations = [];
    try {
      locations = JSON.parse(mapElement.dataset.locations);
    } catch (err) {
      console.error("Invalid JSON in data-locations:", err);
    }
    // If no locations, fallback
    if (!locations.length) alert("No locations provided.");
    displayMap(locations);
  }
  //========================================================================

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log(email,password)
      login(email, password);
    });
  } else {
    console.warn('Form element not found');
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout)
  }
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async ev => {
      ev.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value)
      form.append('email', document.getElementById('email').value)
      form.append('photo', document.getElementById('photo').files[0])
      saveSettingsBtn.textContent = 'Updating...';
       await updateSettings(form, "name,email")
      saveSettingsBtn.textContent = 'SAVE SETTINGS';

    })
  }
  if (savePasswordBtn){
    savePasswordBtn.addEventListener('click', async ev => {
      ev.preventDefault();
      savePasswordBtn.textContent = 'Updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password =  document.getElementById('password').value;
      const passwordConfirm =  document.getElementById('password-confirm').value;
      await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");
      savePasswordBtn.textContent = 'SAVE PASSWORD';
    })
  }
});
