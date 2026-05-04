const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/Medlink-Management';

const importData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB...');
        const files = [
            { name: 'Medlink.ayurvedic.json', collection: 'ayurvedic' },
            { name: 'Medlink.fitnessDeals.json', collection: 'fitnessDeals' },
            { name: 'Medlink.personalCare.json', collection: 'personalCare' },
            { name: 'Medlink.sliderImages.json', collection: 'sliderImages' },
            { name: 'Medlink.surgicalDeals.json', collection: 'surgicalDeals' },
            { name: 'Medlink.surgicalDevices.json', collection: 'surgicalDevices' }
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, file.name);
            
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                let data = JSON.parse(rawData);
                data = data.map(item => {
                    if (item._id && item._id.$oid) {
                        item._id = item._id.$oid;
                    }
                    return item;
                });
                const Model = mongoose.model(file.collection, new mongoose.Schema({}, { strict: false, collection: file.collection }));

                await Model.deleteMany({});
                await Model.insertMany(data);
                console.log(`Imported: ${file.name} -> Collection: ${file.collection}`);
            } else {
                console.warn(`Warning: Could not find file ${file.name}`);
            }
        }

        console.log('SUCCESS: All data imported!');
        process.exit();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

importData();