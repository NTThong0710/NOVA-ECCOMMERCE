const axios = require('axios');
const redis = require('redis');

async function runTest() {
  const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });
  await client.connect();
  
  try {
    console.log("Registering...");
    await axios.post('http://localhost:8081/auth/register', { username: 'testuser5', password: 'password' }).catch(e => {});
    
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:8081/auth/login', { username: 'testuser5', password: 'password', captchaToken: 'bypass' });
    console.log("Login Res:", loginRes.data);
    
    const otp = await client.get('otp:testuser5');
    console.log("OTP from Redis:", otp);
    
    console.log("Verifying OTP...");
    const verifyRes = await axios.post('http://localhost:8081/auth/verify-otp', { username: 'testuser5', otpCode: otp });
    console.log("Verify Res:", verifyRes.data);
    
    const token = verifyRes.data.token;
    console.log("Token:", token);
    
    console.log("Fetching sessions...");
    const sessionRes = await axios.get('http://localhost:8081/auth/sessions', { headers: { Authorization: `Bearer ${token}` } });
    console.log("Session Res:", sessionRes.data);
    
  } catch(e) {
    console.error("Error:", e.response ? e.response.data : e.message);
    if(e.response && e.response.status === 401) {
        console.error("Got 401 Unauthorized");
    }
  } finally {
    await client.quit();
  }
}
runTest();
