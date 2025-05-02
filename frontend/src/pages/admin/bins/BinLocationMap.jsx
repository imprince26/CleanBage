import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-hot-toast";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Filter,
} from "lucide-react";
import api from "@/utils/api";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons for different waste types and states
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
  hazardous: createMarkerIcon("#eab308"),
  mixed: createMarkerIcon("#6b7280"),
  overflow: createMarkerIcon("#ef4444"),
  maintenance: createMarkerIcon("#f97316"),
  inactive: createMarkerIcon("#94a3b8"),
};

const WASTE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "organic", label: "Organic Waste" },
  { value: "recyclable", label: "Recyclable" },
  { value: "hazardous", label: "Hazardous" },
  { value: "mixed", label: "Mixed Waste" },
];

const BIN_STATUS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "overflow", label: "Overflow" },
];

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const BinLocationMap = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState([23.024349, 72.5301521]); // Default to Ahmedabad
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [filters, setFilters] = useState({
    wasteType: "all",
    status: "all",
    search: "",
  });

  const fetchBins = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        limit: 1000, // Get more bins for the map view
      });

      const response = await api.get(`/admin/bins?${queryParams}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch bins");
      }

      // Format bins data for map
      const formattedBins = response.data.data.map(bin => ({
        ...bin,
        location: {
          ...bin.location,
          coordinates: [
            parseFloat(bin.location.coordinates[1]), // Latitude
            parseFloat(bin.location.coordinates[0])  // Longitude
          ]
        }
      }));

      setBins(formattedBins);
      toast.success(`Loaded ${formattedBins.length} bins`);
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error(error.message || "Failed to fetch bins");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBins();
  }, [fetchBins]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBinClick = (binId) => {
    navigate(`/admin/bins/${binId}`);
  };

  const filteredBins = useMemo(() => {
    return bins.filter(bin => {
      if (filters.wasteType !== "all" && bin.wasteType !== filters.wasteType) {
        return false;
      }
      if (filters.status !== "all" && bin.status !== filters.status) {
        return false;
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          bin.binId.toLowerCase().includes(searchTerm) ||
          bin.location.address.street.toLowerCase().includes(searchTerm) ||
          bin.location.address.area.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [bins, filters]);

  const getFillLevelColor = (level) => {
    if (level >= 80) return "text-red-500";
    if (level >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bin Location Map</CardTitle>
              <CardDescription>
                Monitor and manage waste bins across the city
              </CardDescription>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Filters Section */}
          <div className="border-b p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
              <Select
                value={filters.wasteType}
                onValueChange={(value) => handleFilterChange("wasteType", value)}
              >
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

              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {BIN_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search bins..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-[200px]"
              />

              <Button
                onClick={fetchBins}
                variant="outline"
                className="flex-shrink-0"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredBins.length} bins shown
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="h-[700px] relative">
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

              {filteredBins.map((bin) => (
                <Marker
                  key={bin._id}
                  position={bin.location.coordinates}
                  icon={markerIcons[bin.status === "overflow" ? "overflow" : bin.wasteType]}
                >
                  <Popup>
                    <div className="space-y-2 w-[200px]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{bin.binId}</h3>
                        <Badge variant="outline">{bin.wasteType}</Badge>
                      </div>
                      
                      <p className="text-sm">
                        {bin.location.address.street}, {bin.location.address.area}
                      </p>

                      <div className="space-y-1">
                        <div className="text-sm flex justify-between">
                          <span>Fill Level:</span>
                          <span className={getFillLevelColor(bin.fillLevel)}>
                            {bin.fillLevel}%
                          </span>
                        </div>
                        <Progress value={bin.fillLevel} />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleBinClick(bin._id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Controls */}
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

export default BinLocationMap;