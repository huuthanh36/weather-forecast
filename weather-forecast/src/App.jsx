import { useState } from "react";
import WeatherForecastBackground from "./components/WeatherForecastBackground";

const App = () => {
  const [weather] = useState(null);

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

  return (
    <div className="min-h-screen">
      <WeatherForecastBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div
          className="bg-transparent backdrop-filter backdrop-blur-md
        rounded-xl shadow-2xl p-8 max-w-md text-white w-full border 
        border-white/30 relative z-10 text-center"
        >
          <h1 className="text-3xl font-extrabold text-center mb-6">
            Weather Forecast App
          </h1>
        </div>
      </div>
    </div>
  );
};

export default App;
