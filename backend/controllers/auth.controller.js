import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { pinJSONToIPFS, getFromIPFS } from "../utils/pinata.js";

export const signup = async (req, res) => {
  try {
    console.log('Signup Request Body:', req.body); // Debug incoming data
    const { username, email, password } = req.body; // Changed from 'name' to 'username' to match model
    if (!username || !email || !password) {
      console.log('Missing fields:', { username, email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailHash = createHash('sha256').update(email).digest('hex');
    const userExist = await User.findOne({ $or: [{ username }, { emailHash }] });
    if (userExist) {
      console.log('User exists:', userExist);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { email, passwordHash: hashedPassword };
    const ipfsHash = await pinJSONToIPFS(userData);
    console.log('Generated IPFS Hash:', ipfsHash);

    const user = new User({
      username,
      ipfsHash,
      emailHash,
    });
    await user.save();
    console.log('Saved User:', user);

    let token;
    try {
      token = generateTokenAndSetCookie(res, user._id);
    } catch (error) {
      console.log("Error in generating token and setting cookie", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token:token,
      user: {
        _id: user._id,
        username: user.username,
        email, 
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login Request Body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing fields:', { email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailHash = createHash('sha256').update(email).digest('hex');
    const user = await User.findOne({ emailHash });
    if (!user) {
      console.log('User not found for emailHash:', emailHash);
      return res.status(400).json({ message: "User not found" });
    }

    let ipfsData;
    try {
      ipfsData = await getFromIPFS(user.ipfsHash);
      console.log('Fetched IPFS Data:', ipfsData);
    } catch (error) {
      console.error('Error fetching IPFS data:', error);
      return res.status(500).json({ message: "Error retrieving user data from IPFS" });
    }

    const isPasswordMatch = await bcrypt.compare(password, ipfsData.passwordHash);
    if (!isPasswordMatch) {
      console.log('Password mismatch for user:', user.username);
      return res.status(400).json({ message: "Invalid password" });
    }

    let token;
    try {
      token = generateTokenAndSetCookie(res, user._id);
    } catch (error) {
      console.log("Error in generating token and setting cookie", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token:token,
      user: {
        _id: user._id,
        username: user.username,
        email: ipfsData.email,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const checkAuth = async (req, res) => {
  console.log('checkAuth req.user:', req.user); // Debug middleware
  const user = req.user;
  if (!user || !user.ipfsHash) {
    console.log('Invalid user object:', user);
    return res.status(401).json({ message: "Unauthorized: User not found or missing IPFS hash" });
  }

  let ipfsData;
  try {
    ipfsData = await getFromIPFS(user.ipfsHash);
    console.log('Fetched IPFS Data for checkAuth:', ipfsData);
  } catch (error) {
    console.error('Error fetching IPFS data in checkAuth:', error);
    return res.status(500).json({ message: "Error retrieving user data from IPFS" });
  }

  return res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: {
      _id: user._id,
      username: user.username,
      email: ipfsData.email,
      password: undefined,
    },
  });
};