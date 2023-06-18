import { isAuthenticated } from ".";
import Cookies from "js-cookie";
import axios from "axios";
import env from "./env";

export default function NeedAuth({ auth, defaults }) {
	if (!isAuthenticated()) {
		return defaults;
	} else {
		return auth;
	}
}

export const ProcessContent = (content) => {
	const parser = new DOMParser();
	const parsedContent = parser.parseFromString(content, "text/html");
	const textContent = parsedContent.body.textContent;

	return textContent;
};

export const GetUser = () => {
	return JSON.parse(Cookies.get("user"));
};

export const getUserCoordinates = async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        await getCityName(latitude, longitude).then((city) => {
          resolve({latitude, longitude, city});
        });
      },
      (error) => {
        reject(error);
      }, 
      {
        enableHighAccuracy: false, // Précision basse
        timeout: 5000, // Délai maximal d'attente en millisecondes
        maximumAge: 0 // Ne pas utiliser de cache de position antérieure
      }
    );
  });
};

export const getCityName = async (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    const apiKey = env.apis.geocode;
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`)
      .then((response) => {
        const resultat = response.data.results.find((resultat) => {
          return resultat.address_components.some((component) =>
            component.types.includes("locality")
          );
        });
        
        const longName = resultat
          ? resultat.address_components.find((component) =>
              component.types.includes("locality")
            ).long_name
          : null;

        resolve(longName)
      })
      .catch((error) => {
        reject("Failed to fetch city name");
      });
  });
};


export function truncateString(str, num) {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + '...'
}

export function convertBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      resolve(fileReader.result);
    }
    fileReader.onerror = (error) => {
      reject(error);
    }
  })
}
