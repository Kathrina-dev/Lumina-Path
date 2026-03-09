import { useMap } from "react-leaflet";
import { useEffect } from "react";
import { LatLngExpression} from "leaflet";


export default function UserPoint({ location }: { location: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView(location, 15);
    }
  }, [location]);

  return null;
}