import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faDroplet,
  faEye,
  faGaugeHigh,
  faSun,
  faTemperatureThreeQuarters,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
const GEO_KEY = "bf11ac1bcef52413bd5275e89d024a17";
const KEY = "1867ba878f284fdab8585822260808";
export default function App() {
  const [showInput, setShowInput] = useState(false);
  function handleInput() {
    setShowInput(!showInput);
  }
  return (
    <div className="app">
      
      <Details showInput={showInput} handleInput={handleInput} />

      {showInput && <InputLocation setShowInput={setShowInput} />}
    </div>
  );
}
function Loader() {
  return <h1>Loading...</h1>;
}
function Details({ handleInput, showInput }) {
  const [latlong, setLatLong] = useState({ latitude: null, longitude: null });
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [todayForecast, setTodayForecast] = useState("");
  const [timenow, setTimenow] = useState("");
  const [weekData, setWeekData] = useState(null);
  useEffect(function () {

    navigator.geolocation.getCurrentPosition((position) => {
            console.log(navigator)

      setLatLong({
        latitude: position.coords?.latitude,
        longitude: position.coords?.longitude,
      });

    },
   (error) => {

      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("Please allow location access");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case error.TIMEOUT:
         alert("The request to get user location timed out.");
          break;
        default:
          alert("An unknown error occurred.");
          break;
      }
    }
    );
  }, []);

  useEffect(
    function () {
      if (!latlong.latitude || !latlong.longitude) return;

      async function getLocationName() {
        try{
          console.log("Next line fetching")
          const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latlong.latitude}&lon=${latlong.longitude}&limit=5&appid=${GEO_KEY}`,
        );
        console.log(res);
        if(!res.ok)
          throw new Error("Unable to get the location")
        const data = await res.json();
        setIsLoading(false);
        setLocation(data[0].name);
      }
      catch(err)
       { alert(err.message);}
      }
      getLocationName();
    },
    [latlong.latitude, latlong.longitude],
  );

  useEffect(
    function () {
      if (!location) return;
      async function getOtherDetails() {
       try{
         const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?q=${location}&days=7&key=${KEY}`,
        );
        if(!res.ok)
          throw new Error("Unable to fetch today and weekly data from the API");
        const data = await res.json();

        setTodayForecast(data?.forecast?.forecastday?.[0]);
        setCurrent(data.current)
        setTimenow(new Date(data.location.localtime_epoch*1000).toLocaleTimeString('en-US', { hour12: true }));
        setWeekData(data.forecast.forecastday);
        console.log(data);
       }
       catch(err){
        alert(err.message);
       }
      }
      getOtherDetails();
    },
    [location],
  );
  return (
    <>
      {current && <div className={`details  ${current?.is_day === 1 ? "blue" : "black"}`}>
        <video
    className="background-video"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src={`${current?.is_day === 1 ? "/day.mp4" : "/night.mp4"}`} type="video/mp4" />
  </video>
        <h2>{location}</h2>
        {/* {!showInput && <AddLocation handleInput={handleInput} />} */}
        <Now
      
          current={current}
        
          isLoading={isLoading}
        />

        <Today
        
          forecast={todayForecast}
          timeNDay={timenow}
        />
        {weekData &&<Weekly weekData={weekData}  />}
        <Other current={current} />
      </div>}
    </>
  );
}
function Other({ current }) {
  return (
    <div className="today">
      <div className="other">
        <div className="weather-detail">
          <h6>Feels Like</h6>
          <FontAwesomeIcon icon={faTemperatureThreeQuarters} />
          <span>
            {current.feelslike_c} <sup>°C</sup>
          </span>
        </div>

        <div className="weather-detail">
          <h6>Wind</h6>
          <FontAwesomeIcon icon={faWind} />
          <span>
            {current.wind_kph} <small>km/h</small>
          </span>
        </div>

        <div className="weather-detail">
          <h6>Humidity</h6>
          <FontAwesomeIcon icon={faDroplet} />
          <span>
            {current.humidity} <small>%</small>
          </span>
        </div>

        <div className="weather-detail">
          <h6>UV Index</h6>
          <FontAwesomeIcon icon={faSun} />
          <span>{current.uv}</span>
        </div>

        <div className="weather-detail">
          <h6>Visibility</h6>
          <FontAwesomeIcon icon={faEye} />
          <span>
            {current.vis_km} <small>km</small>
          </span>
        </div>

        <div className="weather-detail">
          <h6>Pressure</h6>
          <FontAwesomeIcon icon={faGaugeHigh} />
          <span>
            {current.pressure_mb} <small>hPa</small>
          </span>
        </div>
      </div>
      {/* <div className="sundetails"></div> */}
    </div>
  );
}
// function AddLocation({ handleInput }) {
//   return (
//     <button className="btn addLocation" onClick={handleInput}>
//       <FontAwesomeIcon icon={faBars} />
//     </button>
//   );
// }

function Today({  forecast, timeNDay }) {
  return (
    <div className="today">
      <h6>Today is {timeNDay.split(' ')[0]} {timeNDay.split(' ')[1]}</h6>
      <div className="todayStatus ">
        {forecast?.hour?.map((el) => (
          <span className="todaythree m-2" key={el.time.split(" ")[1]}>
            <span className="fs-small">{el.time.split(" ")[1]}</span>

            <img src={el.condition.icon} alt={el.condition.text} />

            <span>{el.temp_c}°C</span>
          </span>
        ))}
      </div>
    </div>
  );
}
function Weekly({ weekData }) {
  
  
  if (weekData) {
    return (
      <div className="weekly">
        {weekData.map((el, index) => {
          return (
            <div className="weeklyStatus " key={el.date}>
              <span>{el.date}</span>
              <span>
                {index === 0
                  ? "Today"
                  : index === 1
                    ? "Tomorrow"
                    : new Date(el.date_epoch * 1000).toLocaleDateString(
                        "en-US",
                        { weekday: "short" },
                      )}
              </span>
              <img src={el.day.condition.icon} alt={el.day.condition.text} />
              {/* <span>{el.day.condition.text}</span> */}
              <span>{el.day.mintemp_c}°C</span>
            </div>
          );
        })}
      </div>
    );
  }
}
function Now({  isLoading, current }) {

  const temperature = current?.temp_c;
  const feels_like = current?.feelslike_c;

  return (
    <div className="tempNow">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <span className="weather">{current?.condition?.text}</span>
          <br></br>
          <span className="feels">
            Feels like {feels_like}
            <sup>&deg;</sup>C
          </span>
          <h1 className="temp">
            {temperature}
            <sup>&deg;c</sup>
          </h1>
        </>
      )}
    </div>
  );
}
function InputLocation({ setShowInput }) {
  return (
    <div className="input-area">
      <button onClick={() => setShowInput(false)}>❌</button>
    </div>
  );
}
