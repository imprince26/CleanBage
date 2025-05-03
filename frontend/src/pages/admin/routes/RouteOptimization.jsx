import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Loader2,
  ChevronLeft,
  Map,
  Route,
  Clock,
  Truck,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

const ZONES = [
  { value: "north", label: "North Zone" },
  { value: "south", label: "South Zone" },
  { value: "east", label: "East Zone" },
  { value: "west", label: "West Zone" },
  { value: "central", label: "Central Zone" },
];

const RouteOptimization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedZone, setSelectedZone] = useState("all");
  const [availableBins, setAvailableBins] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [center] = useState([23.0225, 72.5714]); // Default to Ahmedabad

  useEffect(() => {
    fetchAvailableBins();
  }, [selectedZone]);

  const fetchAvailableBins = async () => {
    setLoading(true);
    try {
      const response = await api.get("/collections", {
        params: {
          status: "active",
          zone: selectedZone !== "all" ? selectedZone : undefined,
          unassigned: true,
        },
      });
      setAvailableBins(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch bins");
    } finally {
      setLoading(false);
    }
  };

  const addBin = (binId) => {
    const bin = availableBins.find((b) => b._id === binId);
    if (bin && !selectedBins.find((b) => b._id === binId)) {
      setSelectedBins([...selectedBins, bin]);
    }
  };

  const removeBin = (binId) => {
    setSelectedBins(selectedBins.filter((bin) => bin._id !== binId));
  };

  const optimizeRoute = async () => {
    if (selectedBins.length < 2) {
      toast.error("Please select at least 2 bins to optimize");
      return;
    }

    setOptimizing(true);
    try {
      const response = await api.post("/routes/optimize", {
        bins: selectedBins,
        startLocation: {
          coordinates: selectedBins[0].location.coordinates,
        },
        endLocation: {
          coordinates: selectedBins[selectedBins.length - 1].location.coordinates,
        },
      });

      if (response.data.success) {
        setOptimizedRoute(response.data.data);
        toast.success("Route optimized successfully");
      }
    } catch (error) {
      toast.error("Failed to optimize route");
    } finally {
      setOptimizing(false);
    }
  };

  const createRoute = async () => {
    if (!optimizedRoute || !selectedBins.length) {
      toast.error("Please optimize the route first");
      return;
    }

    try {
      const routeData = {
        name: `Optimized Route ${new Date().toLocaleDateString()}`,
        bins: optimizedRoute.bins.map((bin, index) => ({
          bin: bin._id,
          order: index + 1,
          estimated_time: bin.estimated_time,
        })),
        startLocation: {
          coordinates: selectedBins[0].location.coordinates,
          address: selectedBins[0].location.address,
        },
        endLocation: {
          coordinates: selectedBins[selectedBins.length - 1].location.coordinates,
          address: selectedBins[selectedBins.length - 1].location.address,
        },
        zone: selectedZone !== "all" ? selectedZone : "mixed",
        estimatedTime: optimizedRoute.duration,
        distance: optimizedRoute.distance,
        optimized: true,
      };

      const response = await api.post("/routes", routeData);
      if (response.data.success) {
        toast.success("Route created successfully");
        navigate(`/admin/routes/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error("Failed to create route");
    }
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Route Optimization</h1>
          <p className="text-muted-foreground">
            Optimize collection routes for maximum efficiency
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/admin/routes")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Routes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,400px]">
        {/* Map Section */}
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Route Preview</CardTitle>
            <CardDescription>
              Visual preview of the optimized collection route
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px]">
              <MapContainer
                center={center}
                zoom={12}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedBins.map((bin, index) => (
                  <Marker
                    key={bin._id}
                    position={[
                      bin.location.coordinates[1],
                      bin.location.coordinates[0],
                    ]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">Bin #{bin.binId}</p>
                        <p>{bin.location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {optimizedRoute?.path && (
                  <Polyline
                    positions={optimizedRoute.path.map(coord => [coord[1], coord[0]])}
                    color="#3b82f6"
                  />
                )}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Controls Section */}
        <div className="space-y-6 order-1 md:order-2">
          {/* Zone Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Zone Selection</CardTitle>
              <CardDescription>Select zone to filter available bins</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {ZONES.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bin Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Points</CardTitle>
              <CardDescription>
                Select bins to include in the route
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={addBin}>
                <SelectTrigger>
                  <SelectValue placeholder="Add bin to route" />
                </SelectTrigger>
                <SelectContent>
                  {availableBins
                    .filter((bin) => !selectedBins.find((b) => b._id === bin._id))
                    .map((bin) => (
                      <SelectItem key={bin._id} value={bin._id}>
                        #{bin.binId} - {bin.location.address}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBins.map((bin) => (
                      <TableRow key={bin._id}>
                        <TableCell>#{bin.binId}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {bin.location.address}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBin(bin._id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedBins.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground h-24"
                        >
                          No bins selected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedBins([])}
                disabled={selectedBins.length === 0}
              >
                Clear All
              </Button>
              <Button
                onClick={optimizeRoute}
                disabled={selectedBins.length < 2 || optimizing}
              >
                {optimizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Optimize Route
              </Button>
            </CardFooter>
          </Card>

          {/* Route Summary */}
          {optimizedRoute && (
            <Card>
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
                <CardDescription>
                  Optimized route details and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="font-medium">
                      {(optimizedRoute.distance / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Estimated Duration
                    </p>
                    <p className="font-medium">{optimizedRoute.duration} mins</p>
                  </div>
                </div>
                <Button onClick={createRoute} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Create Route
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;