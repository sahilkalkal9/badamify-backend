import mongoose from "mongoose";

const setupStuffSchema = new mongoose.Schema(
  {
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["cart", "equipment", "utensil", "branding", "license", "misc"],
      default: "misc",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    pricePerItem: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

setupStuffSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.pricePerItem;
  next();
});

const SetupStuff = mongoose.model("SetupStuff", setupStuffSchema);

export default SetupStuff;