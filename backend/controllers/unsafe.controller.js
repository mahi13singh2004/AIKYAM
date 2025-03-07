import UnsafeArea from '../models/unsafe.model.js';

export const getUnsafeAreas = async (req, res) => {
  try {
    const areas = await UnsafeArea.find();
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markUnsafe = async (req, res) => {
  try {
    const newArea = new UnsafeArea({
      lat: req.body.lat,
      lng: req.body.lng
    });
    
    const savedArea = await newArea.save();
    res.status(201).json(savedArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};