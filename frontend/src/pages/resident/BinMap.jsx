import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useCollection } from "@/context/CollectionContext";
import {
  Navigation2,
  Loader2,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons for different waste types
const createMarkerIcon = (color) => L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const markerIcons = {
  organic: createMarkerIcon("#22c55e"),
  recyclable: createMarkerIcon("#3b82f6"),
  "non-recyclable": createMarkerIcon("#ef4444"),
  hazardous: createMarkerIcon("#eab308"),
  mixed: createMarkerIcon("#6b7280"),
  current: createMarkerIcon("#8b5cf6"),
};

const WASTE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "organic", label: "Organic Waste" },
  { value: "recyclable", label: "Recyclable" },
  { value: "non-recyclable", label: "Non-Recyclable" },
  { value: "hazardous", label: "Hazardous" },
  { value: "mixed", label: "Mixed Waste" },
];

// Map controller component for handling view updates
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Search radius visualization
const SearchRadius = ({ center, radius }) => {
  if (!center || isNaN(center[0]) || isNaN(center[1])) return null;
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        fillColor: "#8b5cf6",
        fillOpacity: 0.1,
        color: "#8b5cf6",
        weight: 1,
      }}
    />
  );
};

const BinMap = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState([23.024349, 72.5301521]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(1000);
  const [selectedType, setSelectedType] = useState("all");
  const [mapZoom, setMapZoom] = useState(15);
  const { getNearbyCollections } = useCollection();

  const fetchNearbyBins = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare coordinates as [longitude, latitude] for backend
      const coordinates = [position[1], position[0]];
      const wasteType = selectedType !== "all" ? selectedType : undefined;

      console.log("Fetching bins with:", { coordinates, searchRadius, wasteType });

      const bins = await getNearbyCollections(coordinates, searchRadius, wasteType);

      // Validate response
      if (!Array.isArray(bins)) {
        throw new Error("Invalid API response: Expected an array of bins");
      }

      // Format bins for Leaflet, handling nested $numberDouble
      const formattedBins = bins.map(bin => {
        if (!bin.location || !bin.location.coordinates) {
          console.warn("Invalid bin location:", bin);
          return null;
        }

        // Parse coordinates to handle $numberDouble
        const coords = bin.location.coordinates.map(coord => {
          if (coord && typeof coord === 'object' && '$numberDouble' in coord) {
            return parseFloat(coord.$numberDouble);
          }
          return parseFloat(coord);
        });

        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
          console.warn("Invalid coordinates for bin:", bin);
          return null;
        }

        return {
          ...bin,
          location: {
            ...bin.location,
            coordinates: [coords[1], coords[0]] // Swap to [latitude, longitude] for Leaflet
          }
        };
      }).filter(bin => bin !== null);

      console.log("Formatted bins:", formattedBins);

      setBins(formattedBins);
      toast.success(`Found ${formattedBins.length} nearby bins`);
    } catch (error) {
      console.error("Error fetching bins:", error.message, error.response?.data);
      toast.error(error.message || "Failed to fetch nearby bins");
      setBins([]);
    } finally {
      setLoading(false);
    }
  }, [position, searchRadius, selectedType, getNearbyCollections]);

  useEffect(() => {
    fetchNearbyBins();
  }, [fetchNearbyBins]);

  const getCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          toast.success("Location updated successfully");
        },
        (error) => {
          toast.error("Failed to get location");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  }, []);

  const handleBinClick = useCallback((binId) => {
    navigate(`/resident/collections/${binId}`);
  }, [navigate]);

  const filteredBins = useMemo(() => {
    const result = selectedType === "all" 
      ? bins 
      : bins.filter((bin) => bin.wasteType === selectedType);
    console.log("Filtered bins:", result);
    return result;
  }, [bins, selectedType]);

  return (
    <div className="container mx-auto py-4 px-4 md:py-6 md:px-6 max-w-7xl">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Waste Bin Map</CardTitle>
              <CardDescription>
                Find and view waste bins in your area
              </CardDescription>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-shrink-0"
              >
                <Navigation2 className="mr-2 h-4 w-4" />
                My Location
              </Button>

              <Button 
                onClick={fetchNearbyBins}
                disabled={loading}
                className="flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Search Radius: {searchRadius}m
                </label>
                <span className="text-sm text-muted-foreground">
                  {filteredBins.length} bins found
                </span>
              </div>
              <Slider
                value={[searchRadius]}
                onValueChange={([value]) => setSearchRadius(value)}
                max={5000}
                min={100}
                step={100}
                className="w-full"
              />
            </div>
          </div>

          <div className="h-[600px] lg:h-[700px] relative">
            <MapContainer
              center={position}
              zoom={mapZoom}
              className="h-full w-full z-0"
              zoomControl={false}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={position} zoom={mapZoom} />
              <SearchRadius center={position} radius={searchRadius} />
              
              <Marker position={position} icon={markerIcons.current}>
                <Popup>Your location</Popup>
              </Marker>

              {filteredBins.map((bin) => {
                console.log("Rendering bin:", bin);
                return (
                  <Marker
                    key={bin._id}
                    position={bin.location.coordinates}
                    icon={markerIcons[bin.wasteType] || markerIcons.mixed}
                  >
                    <Popup>
                      <div className="space-y-2 w-[200px]">
                        <h3 className="font-semibold">{bin.binId}</h3>
                        <p className="text-sm">{bin.location.address?.street || 'Unknown location'}</p>
                        <Badge variant="outline">{bin.wasteType}</Badge>
                        <div className="space-y-1">
                          <div className="text-sm flex justify-between">
                            <span>Fill Level:</span>
                            <span>{bin.fillLevel}%</span>
                          </div>
                          <Progress value={bin.fillLevel} />
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleBinClick(bin._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            <div className="absolute right-4 top-4 flex flex-col gap-2 z-[1000]">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setMapZoom(z => Math.min(z + 1, 18))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setMapZoom(z => Math.max(z - 1, 1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BinMap;