import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Gift, Search, Tag, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import api from '../../utils/api';

const RewardStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [activeTab, setActiveTab] = useState('rewards');
  const [redemptions, setRedemptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    fetchRewards();
    fetchRedemptions();
    fetchTransactions();
  }, []);
  
  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/rewards/items', {
        params: {
          limit: 100
        }
      });
      
      if (res.data.success) {
        setRewards(res.data.data);
        setFilteredRewards(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch rewards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRedemptions = async () => {
    try {
      const res = await api.get('/api/rewards/redemptions');
      
      if (res.data.success) {
        setRedemptions(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };
  
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/api/rewards/transactions');
      
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  // Filter and sort rewards
  useEffect(() => {
    if (!rewards.length) return;
    
    let filtered = [...rewards];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(query) ||
        reward.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(reward => reward.category === categoryFilter);
    }
    
    // Apply sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.pointsCost - b.pointsCost);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.pointsCost - a.pointsCost);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: featured
      filtered.sort((a, b) => (b.featuredOrder || 0) - (a.featuredOrder || 0));
    }
    
    setFilteredRewards(filtered);
  }, [searchQuery, categoryFilter, sortBy, rewards]);
  
  // Get unique categories from rewards
  const getCategories = () => {
    const categories = new Set(rewards.map(reward => reward.category));
    return Array.from(categories);
  };
  
  return (
    <div>
      <PageHeader
        title="Reward Store"
        description={`You have ${user.rewardPoints || 0} points to redeem`}
        backLabel="Back to Dashboard"
        backOnClick={() => navigate('/resident/dashboard')}
      />
      
      <Tabs defaultValue="rewards" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
          <TabsTrigger value="transactions">Point History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rewards">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Card className="flex-1">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Points</p>
                  <p className="text-2xl font-bold">{user.rewardPoints || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-1">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Redeemed Rewards</p>
                  <p className="text-2xl font-bold">{redemptions.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rewards..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader />
            </div>
          ) : filteredRewards.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-12 w-12" />}
              title="No rewards found"
              description="Try adjusting your filters or check back later for new rewards."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <Card key={reward._id} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={reward.image?.url || '/placeholder.svg?height=200&width=400'}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {reward.pointsCost} Points
                    </div>
                    {reward.remainingQuantity === 0 && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm font-medium rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>{reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}</span>
                    </div>
                    {reward.remainingQuantity > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {reward.remainingQuantity} remaining
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      variant={user.rewardPoints >= reward.pointsCost && reward.remainingQuantity > 0 ? 'default' : 'outline'}
                      disabled={user.rewardPoints < reward.pointsCost || reward.remainingQuantity === 0}
                      asChild
                    >
                      <Link to={`/resident/rewards/${reward._id}`}>
                        {user.rewardPoints < reward.pointsCost
                          ? 'Not Enough Points'
                          : reward.remainingQuantity === 0
                          ? 'Out of Stock'
                          : 'View Reward'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="redemptions">
          <Card>
            <CardHeader>
              <CardTitle>My Redeemed Rewards</CardTitle>
              <CardDescription>
                View all the rewards you have redeemed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <EmptyState
                  icon={<Gift className="h-12 w-12" />}
                  title="No redemptions yet"
                  description="You haven't redeemed any rewards yet. Browse the reward store to find something you like!"
                  actionLabel="Browse Rewards"
                  actionOnClick={() => setActiveTab('rewards')}
                />
              ) : (
                <div className="space-y-4">
                  {redemptions.map((redemption) => (
                    <div key={redemption._id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={redemption.rewardItem.image?.url || '/placeholder.svg?height=64&width=64'}
                          alt={redemption.rewardItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{redemption.rewardItem.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Redeemed on {new Date(redemption.redeemedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              redemption.status === 'used' ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {redemption.status === 'used' ? 'Used' : 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="text-xs font-medium">Redemption Code:</p>
                          <p className="font-mono text-sm">{redemption.code}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {redemption.rewardItem.pointsCost} points
                          </p>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Point Transaction History</CardTitle>
              <CardDescription>
                View your point earning and redemption history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={<Award className="h-12 w-12" />}
                  title="No transactions yet"
                  description="You haven't earned or spent any points yet. Start reporting bins to earn points!"
                  actionLabel="Report a Bin"
                  actionOnClick={() => navigate('/resident/report-bin')}
                />
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'earned' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {transaction.type === 'earned' ? (
                          <Award className="h-5 w-5" />
                        ) : (
                          <Gift className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              {transaction.type === 'earned' ? 'Points Earned' : 'Points Redeemed'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {transaction.description || (
                                transaction.type === 'earned' 
                                  ? `Earned from ${transaction.sourceType.replace('_', ' ')}` 
                                  : 'Redeemed for reward'
                              )}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            <span className={transaction.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}>
                              {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.points)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardStore;