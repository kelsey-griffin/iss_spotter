/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    let data = JSON.parse(body);
    callback(null, data.ip);
  });
};


const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    let obj = JSON.parse(body);
    callback(null, {latitude: obj.data.latitude, longitude: obj.data.longitude});
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  const http = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(http, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    let obj = JSON.parse(body);
    callback(null, obj.response);
  });
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work at fetchMyIP!" , error);
      return;
    }
    // console.log('It worked! Returned IP:' , ip);
    fetchCoordsByIP(ip, (error, coodinates) => {
      if (error) {
        console.log("It didn't work at fetchCoordsByIP!" , error);
        return;
      }
      // console.log('It worked! Returned coodinates:' , coodinates);
      fetchISSFlyOverTimes(coodinates, (error, data) => {
        if (error) {
          console.log("It didn't work at fetchISSFlyOverTimes!" , error);
          return;
        }
        // console.log('It worked! Returned data: ', data);
        const passTimes = []
        data.forEach(element => {
          let date = new Date(element.risetime * 1000);
          passTimes.push(`Next pass at ${date.toString()} for ${element.duration} seconds!`)
        });
        callback(null, passTimes)
      });
    });
  });
};  

module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };