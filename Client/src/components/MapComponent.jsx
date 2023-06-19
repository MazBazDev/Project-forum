import React, { useEffect, useState } from "react";
import env from "../env";

const MapComponent = ({ topics, setLocatedTopics }) => {
  const [bounds, setBounds] = useState();
  const [circles, setCircles] = useState([]);
  const [map, setMap] = useState(null); // Ajout de la variable map

  useEffect(() => {
    // Fonction d'initialisation de la carte
    const initMap = () => {
      // Coordonnées du point spécifique à vérifier
      const targetPoint = { lat: 45.750498, lng: 4.842467 };

      // Options de la carte
      const mapOptions = {
        center: targetPoint, // Centrer la carte sur le point spécifique
        zoom: 10, // Niveau de zoom initial
        disableDefaultUI: true, // Désactiver les contrôles par défaut
        zoomControl: true,
      };

      // Créer la carte
      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );

      // Écouter l'événement de mouvement de la carte
      newMap.addListener("idle", () => {
        // Récupérer les limites de la partie visible de la carte
        setBounds(newMap.getBounds());
      });

      setMap(newMap); // Mettre à jour la variable map
    };

    // Charger l'API Google Maps
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${env.apis.geocode}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    };

    // Appeler la fonction de chargement de l'API Google Maps
    loadGoogleMapsScript();
  }, []);

  const updateLocatedTopics = () => {
    if (bounds && topics != null) {
      const locatedTopics = topics.filter((topic) =>
        bounds.contains({
          lat: topic.coordinates.lat,
          lng: topic.coordinates.long,
        })
      );
      setLocatedTopics(locatedTopics);
      updateDensityCircles(locatedTopics);
    }
  };

  const updateDensityCircles = (locatedTopics) => {
    // Supprimer les cercles existants
    circles.forEach((circle) => {
      circle.setMap(null);
    });

    const densityCircles = {};

    // Calculer la densité des topics par ville
    locatedTopics.forEach((topic) => {
      const { lat, long } = topic.coordinates;
      const key = `${lat}-${long}`;
      densityCircles[key] = (densityCircles[key] || 0) + 1;
    });

    // Créer les cercles de densité
    const newCircles = Object.entries(densityCircles).map(([key, count]) => {
      const [lat, lng] = key.split("-").map(parseFloat);
      const circleOptions = {
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getCircleColor(count),
        fillOpacity: 0.35,
        map: map, // Utiliser la variable map
        center: { lat, lng },
        radius: count * 2000, // Ajuster la taille du cercle en fonction du nombre de topics
      };

      const circle = new window.google.maps.Circle(circleOptions);
      return circle;
    });

    setCircles(newCircles);
  };

  const getCircleColor = (count) => {
    // Définir la couleur du cercle en fonction du nombre de topics
    if (count < 5) {
      return "#FF0000"; // Rouge
    } else if (count < 10) {
      return "#FFA500"; // Orange
    } else {
      return "#FFFF00"; // Jaune
    }
  };

  useEffect(() => {
    if (bounds) {
      updateLocatedTopics();
    }
  }, [bounds]);

  return <div id="map" style={{ height: "400px", width: "100%" }}></div>;
};

export default MapComponent;
