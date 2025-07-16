<h1>🌍 Natours App – Tour Booking API</h1>

<p><strong>By:</strong> Dvir Karni (<a href="https://github.com/karniDvir">karniDvir</a>)</p>

<hr />

<h2>📦 Project Overview</h2>
<p>
  Natours is a full-featured RESTful API for a fictional tour booking company. It was developed as part of the Udemy course
  <a href="https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/" target="_blank">
    Node.js, Express, MongoDB & More: The Complete Bootcamp
  </a>.
</p>
<p>
  The app allows users to browse tours, manage bookings, leave reviews, and authenticate via JWTs. It features real-world API design patterns, including filtering, pagination, rate limiting, and error handling.
</p>

<hr />

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><strong>Backend:</strong> Node.js, Express</li>
  <li><strong>Database:</strong> MongoDB, Mongoose ODM</li>
  <li><strong>Authentication:</strong> JWT (JSON Web Tokens)</li>
  <li><strong>APIs:</strong> RESTful endpoints for tours, users, bookings, and reviews</li>
  <li><strong>Other:</strong> Multer for file uploads, Helmet & Rate Limiting for security, and custom error middleware</li>
</ul>

<hr />

<h2>📁 Features</h2>
<ul>
  <li>Tour creation, updating, and filtering (e.g. price, difficulty)</li>
  <li>User authentication & role-based access (admin, guide, user)</li>
  <li>Review & rating system for tours</li>
  <li>Image upload and processing using Multer and Sharp</li>
  <li>Geospatial queries for finding tours within a radius</li>
  <li>Security best practices: data sanitization, rate limiting, HTTP headers, and more</li>
</ul>

<hr />

<h2>📷 Screenshots</h2>
<p><em>Add screenshots or a YouTube demo link here!</em></p>

<hr />

<h2>📥 Installation</h2>
<pre><code>git clone https://github.com/karniDvir/natours-app.git
cd natours-app
npm install
</code></pre>

<h3>🔐 Set Environment Variables</h3>
<pre><code>Create a file named <code>config.env</code> and add:
PORT=3000
DATABASE=mongodb+srv://...
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_password
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
</code></pre>

<h3>▶ Run the App</h3>
<pre><code>npm run start:dev</code></pre>

<hr />

<h2>💬 Contact</h2>
<p>
  For feedback or questions, feel free to open an issue or contact me:
  <a href="mailto:dkarni07@gmail.com">dkarni07@gmail.com</a>
</p>
