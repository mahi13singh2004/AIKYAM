import pinataSDK from '@pinata/sdk';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export const pinJSONToIPFS = async (data) => {
  try {
    const result = await pinata.pinJSONToIPFS(data);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error pinning to Pinata:', error);
    throw error;
  }
};

export const getFromIPFS = async (ipfsHash) => {
  try {
    const response = await axios.get(`${process.env.PINATA_GATEWAY}${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};