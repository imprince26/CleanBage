import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader } from '../../components/common/Loader';
import { MapPin, Search, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import api from '../../utils/api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token';

const BinMap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentLocation, getCurrentLocation } = useLocation();
  const { toast } = useToast();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  
  const [loading, setLoading] = useState(true);
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBin, setSelectedBin] = useState(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }
    
    if (map.current) return; // Map already initialized
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [currentLocation.longitude, currentLocation.latitude],
      zoom: 13
    });
    
    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    map.current.addControl(geolocate, 'top-right');
    
    // Load bins when map is ready
    map.current.on('load', () => {
      fetchBins();
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [currentLocation]);
  
  // Fetch bins from API
  const fetchBins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/collections', {
        params: {
          limit: 100
        }
      });
      
      if (res.data.success) {
        setBins(res.data.data);
        setFilteredBins(res.data.data);
        addMarkersToMap(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bins. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add markers to map
  const addMarkersToMap = (binsData) => {
    if (!map.current) return;
    
    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};
    
    binsData.forEach(bin => {
      if (!bin.location?.coordinates) return;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center w-8 h-8 rounded-full cursor-pointer';
      
      // Set marker color based on bin status
      if (bin.status === 'reported') {
        el.innerHTML = `<div class="bg-destructive text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>`;
      } else if (bin.status === 'full') {
        el.innerHTML = `<div class="bg-yellow-500 text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>`;
      } else if (bin.status === 'collected') {
        el.innerHTML = `<div class="bg-green-500 text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>`;
      } else {
        el.innerHTML = `<div class="bg-primary text-white p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>`;
      }
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([bin.location.coordinates[0], bin.location.coordinates[1]])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3 class="font-medium">${bin.binId}</h3>
                <p class="text-sm">${bin.location.address || 'No address'}</p>
                <p class="text-sm mt-1">Status: <span class="font-medium">${bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}</span></p>
                <button class="mt-2 px-2 py-1 bg-primary text-white text-xs rounded" onclick="window.reportBin('${bin._id}')">
                  Report Bin
                </button>
              </div>
            `)
        )
        .addTo(map.current);
      
      markers.current[bin._id] = marker;
      
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedBin(bin);
        
        // Fly to the bin
        map.current.flyTo({
          center: [bin.location.coordinates[0], bin.location.coordinates[1]],
          zoom: 15,
          essential: true
        });
      });
    });
    
    // Add global function to handle report button click in popups
    window.reportBin = (binId) => {
      navigate(`/resident/report-bin?binId=${binId}`);
    };
  };
  
  // Filter bins based on search query and status filter
  useEffect(() => {
    if (!bins.length) return;
    
    let filtered = [...bins];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bin => 
        bin.binId.toLowerCase().includes(query) ||
        (bin.location?.address && bin.location.address.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bin => bin.status === statusFilter);
    }
    
    setFilteredBins(filtered);
    
    // Update markers visibility
    Object.entries(markers.current).forEach(([binId, marker]) => {
      const bin = bins.find(b => b._id === binId);
      if (!bin) return;
      
      const isVisible = filtered.some(b => b._id === binId);
      marker.getElement().style.display = isVisible ? 'block' : 'none';
    });
    
  }, [searchQuery, statusFilter, bins]);
  
  // Fly to selected bin on map
  useEffect(() => {
    if (selectedBin && map.current && selectedBin.location?.coordinates) {
      map.current.flyTo({
        center: [selectedBin.location.coordinates[0], selectedBin.location.coordinates[1]],
        zoom: 15,
        essential: true
      });
      
      // Open popup for selected bin
      const marker = markers.current[selectedBin._id];
      if (marker) {
        marker.togglePopup();
      }
    }
  }, [selectedBin]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };
  
  // Handle bin selection from list
  const handleBinSelect = (bin) => {
    setSelectedBin(bin);
  };
  
  // Get status icon based on bin status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'full':
        return <Trash2 className="h-4 w-4 text-yellow-500" />;
      case 'collected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Trash2 className="h-4 w-4 text-primary" />;
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Bin Map"
        description="View and locate waste bins in your area"
        backLabel="Back to Dashboard"
        backOnClick={() => navigate('/resident/dashboard')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div ref={mapContainer} className="w-full h-full" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Loader />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Bins</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by ID or address"
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="font-medium mb-2">Bins ({filteredBins.length})</h3>
                {filteredBins.length === 0 ? (
                  <div className="text-center py-6">
                    <Trash2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No bins found matching your criteria.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBins.map((bin) => (
                      <div
                        key={bin._id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedBin?._id === bin._id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleBinSelect(bin)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {getStatusIcon(bin.status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{bin.binId}</p>
                          <p className="text-xs text-muted-foreground">
                            {bin.location?.address || 'No address available'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              bin.status === 'reported' ? 'bg-destructive/10 text-destructive' :
                              bin.status === 'full' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              bin.status === 'collected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resident/report-bin?binId=${bin._id}`);
                              }}
                            >
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BinMap;