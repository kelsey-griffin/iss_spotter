const request = require('request-promise-native');

const fetchMyIP = () => {
  return request('https://api.ipify.org?format=json');
};

const fetchCoordsByIP = body => {
  const foundIP = JSON.parse(body).ip;
  return request(`https://ipvigilante.com/${foundIP}`)
};

const fetchISSFlyOverTimes = body => {
  const obj = JSON.parse(body);
  const coords = {lat: obj.data.latitude, lon: obj.data.longitude};
  // console.log("lat: ", coords.lat, "long: ", coords.lon)
  return request(`http://api.open-notify.org/iss-pass.json?lat=${coords.lat}&lon=${coords.lon}`);
}

const nextISSTimesForMyLocation = () => {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data);
      return response;
    });
};

const printPassTimes = passTimes => {
  passTimes.forEach(element => {
    let date = new Date(element.risetime * 1000);
    console.log(`Next pass at ${date.toString()} for ${element.duration} seconds!`);
  });
}
module.exports = { nextISSTimesForMyLocation, printPassTimes };