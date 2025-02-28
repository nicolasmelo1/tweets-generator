# Tweet Generator Model

A machine learning model built with TensorFlow.js that generates Twitter-like content based on a user's previous tweets.

## Overview

This project creates a tweet generator that learns from X (formerly Twitter) data to produce new, original tweets in a similar style to the input data. The system uses a neural network with embeddings and LSTM layers to understand and reproduce tweet-like text.

## Features

- Text generation using TensorFlow.js
- LSTM-based neural network architecture
- Vocabulary building from provided tweets
- Temperature-based sampling for controlled creativity
- Support for seed text to influence generation
- Built-in model persistence through local storage
- Reinforcement learning from user feedback

## Technical Implementation

- **Vocabulary Processing**: Handles tokenization of words and conversion between words and indices
- **Neural Network Architecture**:
  - Embedding layer for word representation
  - LSTM layer for understanding text patterns
  - Dense output layer for next-word prediction
- **Training Process**: Creates sequences from input tweets for supervised learning
- **Generation Algorithm**: Uses temperature-based sampling to balance creativity and coherence

## Usage Example

```typescript
// Create model with custom parameters
const tweetGenerator = new TweetGenerator({
  embeddingDim: 64,
  hiddenUnits: 128,
  maxLength: 20,
  temperature: 0.8,
});

// Train with user's tweets
await tweetGenerator.train(userTweets, 100, 32);

// Generate a new tweet
const generatedTweet = await tweetGenerator.generate("", 15);

// Generate a tweet influenced by seed text
const seededTweet = await tweetGenerator.generate("Just finished", 15);

// Save the model
await tweetGenerator.saveModel("tweet-generator-model");
```

## Implementation Details

- TypeScript implementation with strong type safety
- Handles token sequences with padding and truncation
- Proper memory management with TensorFlow.js tensor disposal
- Reinforcement learning capability to improve based on user feedback
- Support for model saving and loading

## TODO

- Add reinforcement learning capability for model improvement based on user likes/dislikes
- Explore removing stop words from training while preserving natural language output
- Implement a two-stage model architecture with:
  - Content generator focus on key ideas
  - Natural language verification to improve grammatical structure
- Add a mechanism to filter out problematic content
- Improve sampling algorithms for more varied outputs
- Add support for hashtag recognition and generation
- Implement batch generation for efficiency
- Create a simple UI for interacting with the model

## License

MIT
