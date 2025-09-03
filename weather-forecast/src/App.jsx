import { useState } from "react";
import WeatherForecastBackground from "./components/WeatherForecastBackground";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = "8e0e84540f12dd4fcfa1ac04f1170898";

  // Hàm lấy gợi ý địa điểm theo tên
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestion([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestion(data);
    } catch {
      setSuggestion([]);
    }
  };

  // Hàm lấy dữ liệu thời tiết theo tọa độ
  const fetchWeatherData = async (lat, lon, name) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) throw new Error(data.message);
      setWeather({ ...data, name });
      setCity("");
      setSuggestion([]);
    } catch (err) {
      setError("Không tìm thấy dữ liệu thời tiết.");
      setWeather(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi submit form tìm kiếm
  const handleSearch = async (e) => {
    e.preventDefault();
    if (city.length < 3) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      const data = await res.json();
      if (!data.length) throw new Error("Không tìm thấy địa điểm.");
      const s = data[0];
      await fetchWeatherData(
        s.lat,
        s.lon,
        `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
      );
    } catch (err) {
      setError("Không tìm thấy địa điểm.");
      setWeather(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhập vào ô tìm kiếm
  const handleInputChange = (e) => {
    setCity(e.target.value);
    fetchSuggestions(e.target.value);
  };

  // Hàm kiểm tra và trả về điều kiện thời tiết nếu có dữ liệu
  const getWeatherCondition = () => {
    if (!weather || !weather.weather || !weather.sys) return null;
    return {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };
  };

  // Hàm chuyển đổi nhiệt độ
  const convertTemp = (temp) => {
    return unit === "C" ? temp : (temp * 9) / 5 + 32;
  };

  return (
    <div className="min-h-screen">
      <WeatherForecastBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10 text-center">
          <h1 className="text-3xl font-extrabold text-center mb-6">
            Weather Forecast App
          </h1>
          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={handleInputChange}
                placeholder="Enter City or Country (min 3 letters)"
                className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"
              />
              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black/70 shadow-md rounded z-10">
                  {suggestion.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          s.lat,
                          s.lon,
                          `${s.name}, ${s.country}${
                            s.state ? `, ${s.state}` : ""
                          }`
                        )
                      }
                      className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Weather"}
              </button>
              {error && (
                <div className="mt-2 text-red-300 text-sm">{error}</div>
              )}
            </form>
          ) : (
            <div className="mt-6 text-center transition-opacity duration-500">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity("");
                  setSuggestion([]);
                  setError("");
                }}
                className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
              >
                New Search
              </button>
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col items-start">
                  <h2 className="text-2xl font-bold">{weather.name}</h2>
                  <span className="text-xs text-gray-300">
                    Lat: {weather.coord.lat}, Lon: {weather.coord.lon}
                  </span>
                </div>
                <button
                  onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors"
                >
                  &deg;{unit}
                </button>
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold">
                  {convertTemp(weather.main.temp).toFixed(1)}&deg;{unit}
                </span>
                <div className="text-sm text-gray-300">
                  Feels like: {convertTemp(weather.main.feels_like).toFixed(1)}
                  &deg;{unit}
                </div>
              </div>
              <div className="mb-2">
                <span className="text-lg">
                  {weather.weather[0].main} - {weather.weather[0].description}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <div className="flex items-center">
                  <img
                    src="../src/assets/clear.gif"
                    alt="High temperature"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    High: {convertTemp(weather.main.temp_max).toFixed(1)}&deg;
                    {unit}
                  </span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/low-temp.svg"
                    alt="Low temperature"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    Low: {convertTemp(weather.main.temp_min).toFixed(1)}&deg;
                    {unit}
                  </span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/humidity.png"
                    alt="Humidity"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Humidity: {weather.main.humidity}%</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/Fog.gif"
                    alt="Pressure"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Pressure: {weather.main.pressure} hPa</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/Wind.png"
                    alt="Wind speed"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Wind: {weather.wind.speed} m/s</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/Sunrise.png"
                    alt="Sunrise"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    Sunrise:{" "}
                    {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <img
                    src="../src/assets/Sunset.png"
                    alt="Sunset"
                    className="w-5 h-5 mr-2"
                  />
                  <span>
                    Sunset:{" "}
                    {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {error && (
                <div className="mt-2 text-red-300 text-sm">{error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
