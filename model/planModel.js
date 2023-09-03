const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan must have a name'],
    unique: true,
    lowercase: true,
  },
  price: { type: Number, required: [true, 'Plan must have a price'] },
  //   pricePerY: { type: Number, required: [true, 'Plan must have a price'] },
  uloadTokenLimit: {
    type: Number,
    required: [true, 'Plan Must Have an Upload Token limit'],
  },
  conversationTokenLimit: {
    type: Number,
    required: [true, 'Plan Must Have a Conversation Token limit'],
  },
  maxChats: {
    type: Number,
    min: 1,
    required: [true, 'A plan must have maxChats'],
  },
  enabled: { type: Boolean, default: true, select: false },
  description: {
    type: String,
    // required: [true, 'Plan must have description']
  },
});

// planSchema.pre(/AndUpdate$/, function (next) {
//   if(this._update.enabled)
// });

planSchema.pre('save', function (next) {
  if (!this.isModified('enabled')) return next();

  this.name === 'free' && (this.enabled = true);

  next();
});

planSchema.pre(/^find/, function (next) {
  this.sort('-price');

  next();
});

planSchema.pre(/Update$/, function (next) {
  if (!this._update.name) return next();

  const update = this._update;
  delete update.name;

  next();
});

planSchema.pre(/AndUpdate$/, async function (next) {
  if (this._update.enabled) return next();

  if ((await this.model.findOne(this._conditions)).name === 'free')
    this._update.enabled = true;

  next();
});

const Plan = mongoose.model('plan', planSchema);

module.exports = Plan;
