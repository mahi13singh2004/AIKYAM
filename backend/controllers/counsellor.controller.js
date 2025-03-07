import getResponse from "../utils/getResponse.js";

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    const { clean } = await getResponse(message);
    console.log("Sending to frontend:", clean);
    res.status(200).json({ success: true, message: clean });
  } catch (error) {
    console.error("Error in counselor chat:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};