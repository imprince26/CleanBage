// seedDummyData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Collection from './models/collectionModel.js';
import Schedule from './models/scheduleModel.js';
import Report from './models/reportModel.js';
import Feedback from './models/feedbackModel.js';

// Load environment variables
dotenv.config();

const residentId = '6809e4082e58642003d8ae67';
const collectorId = '680fda375772b46c54088434';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    await Collection.deleteMany();
    await Schedule.deleteMany();
    await Report.deleteMany();
    await Feedback.deleteMany();

    // Seed Collections
    const collections = await Collection.insertMany(
      Array.from({ length: 5 }).map((_, i) => ({
        binId: `BIN-${1000 + i}`,
        location: {
          coordinates: [72.5714 + i * 0.001, 23.0225 + i * 0.001],
          address: {
            street: `Street ${i+1}`,
            area: `Area ${i+1}`,
            landmark: `Landmark ${i+1}`,
            postalCode: `3800${i}`
          }
        },
        fillLevel: Math.floor(Math.random() * 100),
        wasteType: ['organic', 'recyclable', 'non-recyclable', 'hazardous', 'mixed'][i % 5],
        capacity: 100,
        status: 'pending',
        reportedBy: residentId,
        assignedCollector: collectorId,
      }))
    );

    // Seed Schedules
    await Schedule.insertMany(
      collections.map((collection, i) => ({
        bin: collection._id,
        collector: collectorId,
        scheduledDate: new Date(Date.now() + i * 86400000), // today + i days
        assignedBy: residentId,
      }))
    );

    // Seed Reports
    await Report.insertMany(
      collections.map((collection, i) => ({
        bin: collection._id,
        collector: collectorId,
        collectionDate: new Date(Date.now() - i * 86400000), // today - i days
        status: 'completed',
        wasteVolume: Math.floor(Math.random() * 20 + 10),
        wasteCategories: {
          organic: Math.floor(Math.random() * 5),
          recyclable: Math.floor(Math.random() * 5),
          nonRecyclable: Math.floor(Math.random() * 5),
          hazardous: Math.floor(Math.random() * 5)
        },
        fillLevelBefore: Math.floor(Math.random() * 100),
        fillLevelAfter: 0,
      }))
    );

    // Seed Feedbacks
    await Feedback.insertMany(
      Array.from({ length: 5 }).map((_, i) => ({
        user: residentId,
        type: ['service', 'app', 'collector', 'bin', 'suggestion'][i % 5],
        rating: Math.floor(Math.random() * 5 + 1),
        title: `Feedback Title ${i+1}`,
        comment: `This is a dummy comment number ${i+1}.`,
        relatedTo: {
          bin: collections[i]._id,
          collector: collectorId
        },
      }))
    );

    console.log('Dummy data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
