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
  const [current, setCurrent] = useState("");
  const [todayForecast, setTodayForecast] = useState("");
  const [timenow, setTimenow] = useState("");
  function handleCurrent(value) {
    setCurrent(value);
  }
  useEffect(function () {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatLong({
        latitude: position.coords?.latitude,
        longitude: position.coords?.longitude,
      });
    });
  }, []);

  useEffect(
    function () {
      if (!latlong.latitude || !latlong.longitude) return;

      async function getLocationName() {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${latlong.latitude}&lon=${latlong.longitude}&limit=5&appid=${GEO_KEY}`,
        );
        const data = await res.json();
        setIsLoading(false);
        setLocation(data[0].name);
      }
      getLocationName();
    },
    [latlong.latitude, latlong.longitude],
  );

  useEffect(
    function () {
      if (!location) return;
      async function getOtherDetails() {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?q=${location}&key=${KEY}`,
        );
        const data = await res.json();

        setTodayForecast(data?.forecast?.forecastday?.[0]);
        setTimenow(data.location.localtime);
        console.log(data);
      }
      getOtherDetails();
    },
    [location],
  );
  return (
    <>
      <div className={`details  ${current.is_day === 1 ? "blue" : "black"}`}>
        <h2>{location}</h2>
        {/* {!showInput && <AddLocation handleInput={handleInput} />} */}
        <Now
          location={location}
          current={current}
          handleCurrent={handleCurrent}
          isLoading={isLoading}
        />

        <Today
          latlong={latlong}
          location={location}
          forecast={todayForecast}
          timeNDay={timenow}
        />
        <Weekly location={location} />
        <Other current={current} />
      </div>
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

function Today({ latlong, location, forecast, timeNDay }) {
  return (
    <div className="today">
      <h2>Today is {timeNDay} </h2>
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
function Weekly({ location }) {
  const [weekData, setWeekData] = useState(null);
  useEffect(
    function () {
      async function getWeeklyData() {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?days=7&q=${location}&key=${KEY}`,
        );

        const data = await res.json();
        console.log("Weekly ", data.forecast.forecastday);
        setWeekData(data.forecast.forecastday);
      }
      getWeeklyData();
    },
    [location],
  );
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
function Now({ location, isLoading, current, handleCurrent }) {
  useEffect(
    function () {
      if (!location) return;
      async function getCurrentDetails() {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?q=${location}&key=${KEY}`,
        );

        const data = await res.json();

        handleCurrent(data.current);
      }
      getCurrentDetails();
    }, // eslint-disable-next-line
    [location],
  );

  const temperature = current?.temp_c;
  const feels_like = current?.feelslike_c;

  return (
    <div className="tempNow">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <span className="weather">{current?.weather?.[0]?.main}</span>
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
