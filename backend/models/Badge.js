import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: String, // icon name or URL
  requiredXP: { type: Number, default: 0 },
  type: { type: String, enum: ["xp", "achievement", "special"], default: "achievement" },
}, { timestamps: true });

export default mongoose.model("Badge", badgeSchema);