import { useState, useEffect, useCallback } from "react";

export type Coordinate = { lat: number; lng: number };

export type GeofenceAlert = {
  type: "blackspot" | "border" | null;
  message: string;
  distanceMeter?: number;
  newCountryCode?: string;
};

// Haversine formula to calculate distance in meters between two coordinates
function getDistanceInMeters(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const BORDER_TRANSITIONS = [
  {
    id: "in-mm",
    name: "India-Myanmar Border (Moreh/Tamu)",
    coord: { lat: 24.238, lng: 94.304 },
    radius: 5000, // 5km border zone
    message: "BORDER CROSSING DETECTED! Driving side switches to RIGHT.",
    newCountry: "MM",
  },
  {
    id: "in-bd",
    name: "India-Bangladesh Border (Petrapole/Benapole)",
    coord: { lat: 23.039, lng: 88.877 },
    radius: 5000,
    message: "Entering Bangladesh. Maximum Highway Speed strictly 80 km/h.",
    newCountry: "BD",
  },
];

export function useGeofence(blackspots: Coordinate[] = []) {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [alert, setAlert] = useState<GeofenceAlert>({ type: null, message: "" });
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkGeofences = useCallback(
    (currentLoc: Coordinate) => {
      // 1. Check Macro-Borders
      for (const border of BORDER_TRANSITIONS) {
        const distance = getDistanceInMeters(currentLoc, border.coord);
        if (distance <= border.radius) {
          setAlert({
            type: "border",
            message: border.message,
            newCountryCode: border.newCountry,
          });
          return; // Prioritize border alerts
        }
      }

      // 2. Check Micro-Blackspots
      let closestBlackspotDist = Infinity;
      for (const spot of blackspots) {
        const dist = getDistanceInMeters(currentLoc, spot);
        if (dist < closestBlackspotDist) {
          closestBlackspotDist = dist;
        }
      }

      if (closestBlackspotDist <= 500) {
        setAlert({
          type: "blackspot",
          message: `CRITICAL DANGER: High-risk accident zone detected ${Math.round(closestBlackspotDist)}m ahead!`,
          distanceMeter: closestBlackspotDist,
        });
      } else {
        setAlert({ type: null, message: "" });
      }
    },
    [blackspots]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsActive(true);
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocation(currentLoc);
        checkGeofences(currentLoc);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve location. Please check permissions.");
        setIsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsActive(false);
    };
  }, [checkGeofences]);

  // Expose manual simulator for testing
  const simulateLocation = (lat: number, lng: number) => {
    const loc = { lat, lng };
    setLocation(loc);
    checkGeofences(loc);
  };

  return { location, alert, isActive, error, simulateLocation, clearAlert: () => setAlert({ type: null, message: "" }) };
}
