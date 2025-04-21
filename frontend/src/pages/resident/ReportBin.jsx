import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useUserLocation } from '../../context/LocationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader } from '../../components/common/Loader';
import { Camera, MapPin, Trash2, X, Upload, Image } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import api from '../../utils/api';

const ReportBin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLocation, getCurrentLocation } = useUserLocation();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [binId, setBinId] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [nearbyBins, setNearbyBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  
  // Get bin ID from query params if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const binIdParam = params.get('binId');
    
    if (binIdParam) {
      fetchBinDetails(binIdParam);
    } else {
      fetchNearbyBins();
    }
  }, [location.search]);
  
  // Get current location if not available
  useEffect(() => {
    if (!currentLocation) {
      getCurrentLocation();
    }
  }, [currentLocation, getCurrentLocation]);
  
  const fetchBinDetails = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/collections/${id}`);
      if (res.data.success) {
        setSelectedBin(res.data.data);
        setBinId(res.data.data.binId);
      }
    } catch (error) {
      console.error('Error fetching bin details:', error);
      setError('Failed to fetch bin details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNearbyBins = async () => {
    if (!currentLocation) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get('/api/collections/nearby', {
        params: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          radius: 2, // 2km radius
          limit: 10
        }
      });
      
      if (res.data.success) {
        setNearbyBins(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching nearby bins:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBinSelect = (bin) => {
    setSelectedBin(bin);
    setBinId(bin.binId);
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 5 images',
        variant: 'destructive',
      });
      return;
    }
    
    const newImages = [...images];
    const newPreviewImages = [...previewImages];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload only image files',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload images less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      newImages.push(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewImages.push(reader.result);
        setPreviewImages([...newPreviewImages]);
      };
      reader.readAsDataURL(file);
    });
    
    setImages(newImages);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviewImages = [...previewImages];
    
    newImages.splice(index, 1);
    newPreviewImages.splice(index, 1);
    
    setImages(newImages);
    setPreviewImages(newPreviewImages);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBin) {
      setError('Please select a bin to report');
      return;
    }
    
    if (!notes.trim()) {
      setError('Please provide a description of the issue');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('reportNotes', notes);
      
      if (currentLocation) {
        formData.append('latitude', currentLocation.latitude);
        formData.append('longitude', currentLocation.longitude);
      }
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const res = await api.post(`/api/collections/${selectedBin._id}/report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        toast({
          title: 'Report Submitted',
          description: 'Thank you for reporting this bin. Your report has been submitted successfully.',
          variant: 'success',
        });
        
        navigate('/resident/dashboard');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError(error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader
        title="Report a Bin"
        description="Report a waste bin that needs attention"
        backLabel="Back to Dashboard"
        backOnClick={() => navigate('/resident/dashboard')}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                Provide details about the bin that needs attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="binId">Bin ID</Label>
                  <Input
                    id="binId"
                    value={binId}
                    onChange={(e) => setBinId(e.target.value)}
                    disabled={!!selectedBin}
                    placeholder="Select a bin from the list"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Description</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the issue with the bin (e.g., overflowing, damaged, etc.)"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {previewImages.length < 5 && (
                      <div
                        className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 photos of the bin (max 5MB each)
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <Loader size="small" className="mr-2" /> : null}
                    {submitting ? 'Submitting Report...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Nearby Bins</CardTitle>
              <CardDescription>
                Select a bin from the list to report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nearbyBins.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No bins found nearby. Please check your location or add a bin ID manually.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={fetchNearbyBins}
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {nearbyBins.map((bin) => (
                    <div
                      key={bin._id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBin?._id === bin._id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleBinSelect(bin)}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{bin.binId}</p>
                        <p className="text-sm text-muted-foreground">
                          {bin.location?.address || 'No address available'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {bin.distance ? `${bin.distance.toFixed(2)} km away` : 'Distance unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  getCurrentLocation();
                  fetchNearbyBins();
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportBin;