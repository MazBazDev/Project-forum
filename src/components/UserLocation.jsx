import React, { useEffect, useState } from "react";
import axios from "axios";
import env from "../env";

const UserLocation = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    const fetchUserCoordinates = async () => {
      try {
        const userCoordinates = await getUserCoordinates();
        setCoordinates(userCoordinates);
        const city = await getCityName(userCoordinates[0], userCoordinates[1]);
        setCityName(city);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserCoordinates();
  }, []);

  const getUserCoordinates = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const getCityName = async (latitude, longitude) => {
    const apiKey = env.apis.geocode // Remplacez par votre clé d'API OpenCage
    const url = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}+${longitude}&pretty=1`;
    try {
        console.log("request sent")
      const response = await axios.get(url);
      const city = response.data.results[0].components.city;
      return city;
    } catch (error) {
      throw new Error("Failed to fetch city name");
    }
  };

  return (
    <div>
      <h2>User Location</h2>
      {coordinates.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <p>
          Latitude: {coordinates[0]}, Longitude: {coordinates[1]}
        </p>
      )}
      {cityName && <p>City: {cityName}</p>}
    </div>
  );
};

export default UserLocation;
