import { useState } from 'react';
import { Gift, Award, Star } from 'lucide-react';
import {motion} from "motion/react"


const Rewards = () => {
  const [points, setPoints] = useState(150);
  const [rewards] = useState([
    {
      id: 1,
      name: 'Eco-Friendly Shopping Bag',
      points: 100,
      description: 'Get a reusable shopping bag made from recycled materials',
      icon: <Gift className="w-6 h-6" />,
    },
    {
      id: 2,
      name: 'Green Points Bonus',
      points: 200,
      description: 'Double your points earnings for the next week',
      icon: <Star className="w-6 h-6" />,
    },
    {
      id: 3,
      name: 'Sustainability Badge',
      points: 300,
      description: 'Earn a special profile badge for your contribution',
      icon: <Award className="w-6 h-6" />,
    },
  ]);

  const handleClaimReward = (rewardPoints) => {
    if (points >= rewardPoints) {
      setPoints(points - rewardPoints);
      // Add logic to handle reward claiming
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-emerald-600 mb-6">Rewards</h1>

      <div className="bg-emerald-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-emerald-800">Your Points</h2>
            <p className="text-3xl font-bold text-emerald-600">{points}</p>
          </div>
          <Award className="w-12 h-12 text-emerald-500" />
        </div>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                {reward.icon}
              </div>
              <span className="text-sm font-medium text-emerald-600">
                {reward.points} points
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {reward.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{reward.description}</p>
            <button
              onClick={() => handleClaimReward(reward.points)}
              disabled={points < reward.points}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                points >= reward.points
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {points >= reward.points ? 'Claim Reward' : 'Insufficient Points'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;